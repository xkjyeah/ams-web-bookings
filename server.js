
const Hapi = require('hapi')
const Joi = require('joi')
const dateformat = require('dateformat');
const firebase = require('firebase-admin');
const axios = require('axios');
const _ = require('lodash');
const querystring = require('querystring')

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
});

const db = app.database();

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
      return db.ref('/vehicles')
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

server.start()
