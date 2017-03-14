const Vue = require('vue/dist/vue');
const VueX = require('vuex').default;
const _ = require('lodash');
const {fbAuth, fbDB, fbStorage, fbSignIn, fbSignOut} = require('./firebase');
const assert = require('assert');
const {formatDate, parseDate} = require('./util/formatDate');

Vue.use(VueX);

const store = new VueX.Store({
  state: {
    user: null,
  },
  mutations: {
    setUser(state, data) {
      state.user = data;
    }
  },
  actions: {
    addNewPlan(context) {
      const newKey = fbDB.ref('pricePlans').push().key
      return fbDB.ref(`pricePlans/${newKey}`).update({
        id: newKey
      })
    },
    deletePlan(context, key) {
      assert(key);
      return fbDB.ref(`pricePlans/${key}`).remove()
    },
    updatePlan(context, data) {
      assert(data.id);
      return fbDB.ref(`pricePlans/${data.id}`)
        .update(_(data)
          .pick(data, _.keys(data).filter(key => data[key] !== undefined))
          .value()
        )
    },
    signIn(context) {
      fbSignIn()
    },
    signOut(state) {
      fbSignOut()
    }
  },
  getters: {

  }
})

////////// Tying the data links between firebase and the store

fbAuth.onAuthStateChanged((user) => {
  if (user) {
    store.commit('setUser', {email:user.email})
  } else {
    store.commit('setUser', null)
  }
})

module.exports = store;
