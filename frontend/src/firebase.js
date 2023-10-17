import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
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
  return getAuth().signInWithPopup(provider);
}
export function fbSignOut() {
  return getAuth().signOut();
}

export function fbSignInPassword(email, password) {
  return getAuth().signInWithEmailAndPassword(email, password)
}
export function fbSignUpPassword(email, password) {
  return getAuth().createUserWithEmailAndPassword(email, password)
}
export function fbResetPassword(email, password) {
  return getAuth().sendPasswordResetEmail(email)
}
