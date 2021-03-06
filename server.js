
const Hapi = require('hapi')
const Joi = require('joi')
const dateformat = require('dateformat');
const firebase = require('firebase-admin');
const axios = require('axios');
const _ = require('lodash');
const querystring = require('querystring')
const twilio = require('twilio')

const {pollVehicleLocations} = require('./smartrax')

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 8999 });

const app = firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: "ams-bookings",
    clientEmail: "background-tasks@ams-bookings.iam.gserviceaccount.com",
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: "https://ams-bookings.firebaseio.com"
}, 'bookings-app');

const twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

const db = app.database();

const vehiclesApp = firebase.initializeApp({
  credential: firebase.credential.cert({
    "type": "service_account",
    "project_id": "ams-bookings-planner",
    "private_key_id": "7761992a59e789b183a66ef3e0a622cd563b37e2",
    "private_key": process.env.VEHICLES_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": "firebase-adminsdk-l61vc@ams-bookings-planner.iam.gserviceaccount.com",
    "client_id": "105540882709216654949",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-l61vc%40ams-bookings-planner.iam.gserviceaccount.com"
  }),
  databaseURL: "https://ams-bookings-planner.firebaseio.com"
}, 'vehicles-app');

function triggerWebhook(booking) {
  return axios.post(process.env.WEBHOOK_URL, booking)
}

function triggerCancellationWebhook(booking) {
  return axios.post(process.env.CANCELLATION_WEBHOOK_URL, booking)
}

function handleNewBooking(booking) {
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

function handleNewCancellation(booking) {
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
function poll(when = Date.now()) {
  const pollNewBookings = new Promise((resolve, reject) => {
    console.log(new Date(when))
    db.ref('/bookings')
      .orderByChild('createdAt')
      .startAt(dateformat(new Date(when - 10 * 60000), "yyyy-mm-dd HH:MM"))
      .endAt(dateformat(new Date(when + 10 * 60000), "yyyy-mm-dd HH:MM"))
      .once('value', (v) => {
        const newBookings = _(v.val())
          .toPairs()
          .map(([id, value]) => ({
            ...value,
            id
          }))
          .filter(v => !v.isProcessed)
          .value()

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
        const newCancellations = _(v.val())
          .toPairs()
          .map(([id, value]) => ({
            ...value,
            id
          }))
          .filter(v => !v.isProcessed)
          .value()

        console.log(`There are ${newCancellations.length} new cancellations`)

        resolve(Promise.all(newCancellations.map(handleNewCancellation)));
      })
  })

  return Promise.all([pollNewBookings, pollCancellations])
}

/**
 * Polls for all the ambulance locations
 */

server.route({
  method: 'POST',
  path: '/poll/{dateTime}',
  config: {
    validate: {
      params: {
        dateTime: Joi.date().required(),
      }
    },
    description: 'Poll the requests at around a particular time',
  },
  handler(request, reply) {
    poll(request.params.dateTime.getTime());
    reply('');
  }
})


server.route({
  method: 'POST',
  path: '/enquiry',
  config: {
    validate: {
      payload: {
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
      }
    },
  },
  async handler (request, reply) {
    try {
      const verifyCaptchaResponse = await axios({
        method: 'POST',
        url: 'https://www.google.com/recaptcha/api/siteverify',
        data: querystring.stringify({
          secret: process.env.RECAPTCHA_SECRET,
          response: request.payload['g-recaptcha-response']
        }),
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        }
      })
      if (verifyCaptchaResponse.data.success !== true) {
        console.log(verifyCaptchaResponse.data)
        return reply('Captcha not verified').code(400)
      }
      await axios.post(process.env.ENQUIRY_WEBHOOK_URL, _.omit(request.payload, ['g-recaptcha-response']))

      reply()
        .redirect(request.payload.redirect)
    } catch (e) {
      console.log(e)
      reply('Internal Error')
        .redirect(request.payload.redirectFail)
    }
  }
})

function keepPolling(when) {
  Promise.race([
    poll(when),
    new Promise((resolve) => setTimeout(resolve, 30000))
  ])
  .then(() => setTimeout(keepPolling, 60000))
}
keepPolling()

function pollForVehicles() {
  Promise.race([
    pollVehicleLocations()
    .then((vehicles) => {
      return vehiclesApp.database().ref('/vehicles')
      .set(vehicles)
    })
    .catch((e) => {
      console.log(e)
    }),
    new Promise((resolve) => setTimeout(resolve, 15000))
  ])
  .then(() => setTimeout(pollForVehicles, 15000))
}
pollForVehicles()

/**
 * Why poll instead of watching? Because when watching,
 * the same message might be returned. There is no guarantee
 * that the new messages in one batch will have been fully handled.
 * In contrast, polling gives us this control.
 */
function pollForNewMessages() {
  const sendSMSes = async (data) => {
    for (let [key, {recipients, message}] of Object.entries(data || {})) {
      try {
        // Rough filter for Singapore phone numbers
        const sanitisedRecipients = recipients.split(/,/g)
        .filter(r => r.length === 8)
        .filter(r => r.startsWith('9') || r.startsWith('8'))
        .map(r => `+65${r}`)

        for (let recipient of sanitisedRecipients) {
          await twilioClient.messages.create({
            body: message,
            to: recipient,
            from: process.env.TWILIO_PHONE_NUMBER,
          })
        }
        vehiclesApp.database().ref(`/sms/${key}/status`)
        .set('sent')
      } catch (e) {
        console.log(e)
        vehiclesApp.database().ref(`/sms/${key}/status`)
        .set('errored')
      }
    }
  }

  Promise.race([
    vehiclesApp.database().ref('/sms')
    .orderByChild('status')
    .equalTo('unsent')
    .once('value')
    .then((d) => {
      const data = d.val()
      return sendSMSes(data)
    })
    .catch((e) => {
      console.log(e)
    }),
    new Promise((resolve) => setTimeout(resolve, 60000))
  ])
  .then(() => setTimeout(pollForNewMessages, 15000))
}
pollForNewMessages()

server.start()
