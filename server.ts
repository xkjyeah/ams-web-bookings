import * as  Hapi from '@hapi/hapi'
import Joi from 'joi'
import firebase from 'firebase-admin';
import axios from 'axios';
import _ from 'lodash';
import * as querystring from 'querystring'

function hardError(message: string): string {
  throw new Error(message)
}

const PORT = process.env.PORT
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || hardError("RECAPTCHA_SECRET is missing")
const ENQUIRY_WEBHOOK_URL = process.env.ENQUIRY_WEBHOOK_URL || hardError("ENQUIRY_WEBHOOK_URL is missing")
const PRIVATE_KEY = process.env.PRIVATE_KEY || hardError("PRIVATE_KEY is missing")
const WEBHOOK_URL = process.env.WEBHOOK_URL || hardError("WEBHOOK_URL is missing")
const CANCELLATION_WEBHOOK_URL = process.env.CANCELLATION_WEBHOOK_URL || hardError("CANCELLATION_WEBHOOK_URL is missing")

const init = async () => {
  const server = Hapi.server({
    port: PORT || 8999,
    host: '0.0.0.0'
  })

  server.validator(Joi)

  /**
   * Polls for all the ambulance locations
   */
  server.route({
    method: 'POST',
    path: '/poll/{dateTime}',
    options: {
      validate: {
        params: Joi.object({
          dateTime: Joi.date().required(),
        }).options({allowUnknown: true})
      },
      description: 'Poll the requests at around a particular time',
    },
    async handler(request, h) {
      poll(request.params.dateTime.getTime());
      return '';
    }
  })

  server.route({
    method: 'POST',
    path: '/enquiry',
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email(),
          message: Joi.string().allow(''),
          name: Joi.string(),
          organization: Joi.string().allow(''),
          redirect: Joi.string(),
          redirectFail: Joi.string()
            .optional()
            .default('https://www.ambulanceservice.com.sg/contact-error'),
          service: Joi.string(),
          telephone: Joi.string().allow(''),
          'g-recaptcha-response': Joi.string(),
        }).options({allowUnknown: true})
      },
    },
    async handler (request, h) {
      try {
        const verifyCaptchaResponse = await axios({
          method: 'POST',
          url: 'https://www.google.com/recaptcha/api/siteverify',
          data: querystring.stringify({
            secret: RECAPTCHA_SECRET,
            response: (request.payload as any)['g-recaptcha-response']
          }),
          headers: {
            'Content-type': 'application/x-www-form-urlencoded'
          }
        })
        if (verifyCaptchaResponse.data.success !== true) {
          console.log(verifyCaptchaResponse.data)
          return h.response('Captcha not verified').code(400)
        }
        await axios.post(ENQUIRY_WEBHOOK_URL, _.omit(request.payload as any, ['g-recaptcha-response']))

        return h.redirect((request.payload as any).redirect)
      } catch (e) {
        console.log(e)
        return h.redirect((request.payload as any).redirectFail)
      }
    }
  })

  await server.start()
  console.log('Server running on %s', server.info.uri);
}

type Booking = {
  id: string
}

const app = firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: "ams-bookings",
    clientEmail: "background-tasks@ams-bookings.iam.gserviceaccount.com",
    privateKey: PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: "https://ams-bookings.firebaseio.com"
}, 'bookings-app');

const db = app.database();

function triggerWebhook(booking: Booking) {
  return axios.post(WEBHOOK_URL, booking)
}

function triggerCancellationWebhook(booking: Booking) {
  return axios.post(CANCELLATION_WEBHOOK_URL, booking)
}

function handleNewBooking(booking: Booking) {
  return triggerWebhook(booking)
  .then(() => {
    db.ref(`/bookings/${booking.id}`)
    .update({
      isProcessed: true
    })
  })
  .catch((err) => {
    console.log(err.stack);
  })
}

function handleNewCancellation(booking: Booking) {
  db.ref(`/bookings/${booking.id}`)
  .once('value')
  .then((value) =>
    triggerCancellationWebhook({
      ...value.val(),
      id: booking.id,
    })
  )
  .then(() => {
    db.ref(`/cancellations/${booking.id}`)
    .update({
      isProcessed: true
    })
  })
  .catch((err) => {
    console.log(err.stack);
  })
}

/**
 * Polls for new submissions from the bookings page, and then
 * triggers the webhook for Zapier
 */
async function poll(when: number) {
  const dateformat = (await import('dateformat')).default

  const pollNewBookings = new Promise((resolve, reject) => {
    console.log(new Date(when))
    db.ref('/bookings')
      .orderByChild('createdAt')
      .startAt(dateformat(new Date(when - 10 * 60000), "yyyy-mm-dd HH:MM"))
      .endAt(dateformat(new Date(when + 10 * 60000), "yyyy-mm-dd HH:MM"))
      .once('value', (v) => {
        const newBookings = Object.entries(v.val() || {})
          .map(([id, value]: [id: string, value: any]) => ({
            ...value,
            id
          }))
          .filter(v => !v.isProcessed)

        console.log(`There are ${newBookings.length} new bookings`)

        resolve(Promise.all(newBookings.map(handleNewBooking)));
      })
  })

  const pollCancellations = new Promise((resolve, reject) => {
    console.log(new Date(when))
    db.ref('/cancellations')
      .orderByChild('createdAt')
      .startAt(dateformat(new Date(when - 10 * 60000), "yyyy-mm-dd HH:MM"))
      .endAt(dateformat(new Date(when + 10 * 60000), "yyyy-mm-dd HH:MM"))
      .once('value', (v) => {
        const newCancellations = Object.entries(v.val() || {})
          .map(([id, value]: [id: string, value: any]) => ({
            ...value,
            id
          }))
          .filter(v => !v.isProcessed)

        console.log(`There are ${newCancellations.length} new cancellations`)

        resolve(Promise.all(newCancellations.map(handleNewCancellation)));
      })
  })

  return Promise.all([pollNewBookings, pollCancellations])
}

function keepPolling(when: number = Date.now()) {
  Promise.race([
    poll(when),
    new Promise((resolve) => setTimeout(resolve, 30000))
  ])
  .then(() => setTimeout(keepPolling, 60000))
}
keepPolling()

init()