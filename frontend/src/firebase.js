import { initializeApp } from 'firebase/app'
import {
  getAuth, GoogleAuthProvider, signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth'
import { getDatabase } from 'firebase/database';

const app = initializeApp({
  apiKey: "AIzaSyDsiq9OIO0yTi2cgLbAjiTtWdKmo7HNBPE",
  authDomain: "ams-bookings.firebaseapp.com",
  databaseURL: "https://ams-bookings.firebaseio.com",
  storageBucket: "ams-bookings.appspot.com",
  messagingSenderId: "245600362111"
});

const provider = new GoogleAuthProvider();

export function fbDB() {
  return getDatabase(app);
}

export function fbSignInGoogle() {
  return signInWithPopup(getAuth(), provider);
}
export function fbSignOut() {
  return signOut(getAuth());
}

export function fbSignInPassword(email, password) {
  return signInWithEmailAndPassword(getAuth(), email, password)
}
export function fbSignUpPassword(email, password) {
  return createUserWithEmailAndPassword(getAuth(), email, password)
}
export function fbResetPassword(email, password) {
  return sendPasswordResetEmail(getAuth(), email)
}
