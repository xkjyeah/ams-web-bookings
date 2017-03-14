const firebase = require('firebase');

const app = firebase.initializeApp({
    apiKey: "AIzaSyDsiq9OIO0yTi2cgLbAjiTtWdKmo7HNBPE",
    authDomain: "ams-bookings.firebaseapp.com",
    databaseURL: "https://ams-bookings.firebaseio.com",
    storageBucket: "ams-bookings.appspot.com",
    messagingSenderId: "245600362111"
});

const provider = new firebase.auth.GoogleAuthProvider();

module.exports = {
  fbAuth: app.auth(),
  fbDB: app.database(),
  fbStorage: app.storage(),

  fbSignIn() {
    return app.auth().signInWithPopup(provider);
  },
  fbSignOut() {
    return app.auth().signOut();
  }
};
