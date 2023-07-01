import Vue from 'vue'
import VueX from 'vuex'
import _ from 'lodash'
import { fbAuth, fbDB } from './firebase'
import assert from 'assert'

Vue.use(VueX);

const store = new VueX.Store({
  state: {
    user: null,
    userData: null,
    isLoading: false,
    errorMessage: '',
    errorType: '',
    isAdmin: false,
    trustedEmails: [],
    isTrusted: () => false,
    now: new Date(),

    modal: null,
  },
  mutations: {
    setModal(state, modal) {
      state.modal = modal;
    },
    setNow(state, data) {
      state.now = new Date;
    },
    setIsAdmin(state, data) {
      state.isAdmin = data;
    },
    setUser(state, data) {
      state.user = data;
    },
    setUserData(state, data) {
      state.userData = data;
    },
    setTrustedEmails(state, data) {
      state.trustedEmails = data;
      state.isTrusted = (testEmail) => {
        const rv = state.trustedEmails.find(email => {
          if (email.startsWith('@')) {
            return testEmail.endsWith(email)
          } else {
            return email.toLowerCase() == testEmail.toLowerCase()
          }
        })
        return rv;
      }
    },
    setIsLoading(state, data) {
      state.isLoading = data
    },
    setErrorMessage(state, data) {
      if (!data) {
        state.errorMessage = null;
        state.errorType = null;
      } else {
        assert(data.message || data.code)
        state.errorMessage = data.message || data.code
        state.errorType = data.type || 'error'
      }
    },
  },
  actions: {
    loadingSpinner(context, promise) {
      context.commit('setIsLoading', true)

      return promise.then(
        () => context.commit('setIsLoading', false),
        (err) => {
          context.commit('setIsLoading', false)
          throw err; // don't suppress
        }
      )
    },
    flashError(context, message) {
      context.commit('setErrorMessage', message)
      return new Promise((resolve) => {
        setTimeout(() => {
          context.commit('setErrorMessage', null)
          resolve()
        }, 5000)
      })
    },
  },
  getters: {

  }
})

////////// Tying the data links between firebase and the store

let userData = {};

fbDB.ref('/users')
  .once('value', (userDataResponse) => {
    let userData = userDataResponse.val();
    store.commit('setTrustedEmails', _.values(userData).map(u => u.email))
  })

setInterval(() => {
  store.commit('setNow')
}, 60000);

fbAuth.onAuthStateChanged((user) => {
  if (user) {
    store.commit('setUser', user)
    store.commit('setUserData', _.values(userData).find(u => u.email == user.email))

    Promise.race([
      new Promise((resolve, reject) => {
        // Do a privileged action, and expect it to succeed
        fbDB.ref('/admins')
          .orderByKey()
          .limitToFirst(1)
          .once('value', (userDataResponse) => {
            resolve(true)
          })
      }),
      new Promise((resolve) => setTimeout(() => resolve(false), 10000))
    ])
      .then((amIAdmin) => {
        store.commit('setIsAdmin', amIAdmin)
      })

  } else {
    store.commit('setUser', null)
    store.commit('setUserData', null)
    store.commit('setIsAdmin', false)
  }
})

export default store;
