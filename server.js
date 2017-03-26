const Hapi = require('hapi')
const Joi = require('joi')
const dateformat = require('dateformat');
const firebase = require('firebase-admin');
const rp = require('request-promise');
const _ = require('lodash');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 8999 });

const app = firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: "ams-bookings",
    clientEmail: "background-tasks@ams-bookings.iam.gserviceaccount.com",
    privateKey: process.env.PRIVATE_KEY
  }),
  databaseURL: "https://ams-bookings.firebaseio.com"
});

const db = app.database();

function triggerWebhook(booking) {
  return rp({
    uri: process.env.WEBHOOK_URL.replace(/ /g, '\n'),
    json: true,
    body: booking
  })
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

function poll(when = Date.now()) {
  return new Promise((resolve, reject) => {
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
          // .filter(v => !v.isProcessed)
          .value()

        console.log(`There are ${newBookings.length} new bookings`)

        resolve(Promise.all(newBookings.map(handleNewBooking)));
      })
  })
}

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

function keepPolling(when) {
  Promise.race([
    poll(when),
    new Promise((resolve) => setTimeout(resolve, 30000))
  ])
  .then(() => setTimeout(keepPolling, 60000))
}
keepPolling()

server.start()
