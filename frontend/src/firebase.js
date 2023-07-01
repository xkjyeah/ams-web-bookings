const { initializeApp } = require('firebase');
const { getDatabase } = require('firebase/database')
const { getAuth, GoogleAuthProvider } = require('firebase/auth')

const app = initializeApp({
  apiKey: "AIzaSyDsiq9OIO0yTi2cgLbAjiTtWdKmo7HNBPE",
  authDomain: "ams-bookings.firebaseapp.com",
  databaseURL: "https://ams-bookings.firebaseio.com",
  storageBucket: "ams-bookings.appspot.com",
  messagingSenderId: "245600362111"
});

const fbAuth = getAuth(app)

const provider = new GoogleAuthProvider();

module.exports = {
  fbAuth,
  fbDB: getDatabase(app),

  fbSignInGoogle() {
    return fbAuth.signInWithPopup(provider);
  },
  fbSignOut() {
    return fbAuth.signOut();
  },

  fbSignInPassword(email, password) {
    return fbAuth.signInWithEmailAndPassword(email, password)
  },
  fbSignUpPassword(email, password) {
    return fbAuth.createUserWithEmailAndPassword(email, password)
  },
  fbResetPassword(email, password) {
    return fbAuth.sendPasswordResetEmail(email)
  },
};
