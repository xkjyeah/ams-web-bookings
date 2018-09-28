<template>
<v-app>
  <v-content>
    <v-toolbar>
      <v-toolbar-title>{{user ? user.email : 'AMS Bookings'}}</v-toolbar-title>
      <v-spacer />
      <template v-if="!isAdmin">
        <v-btn icon tag="a" href="#/" >
          <v-icon>mdi-plus</v-icon>
          <!-- <span>New Booking</span> -->
        </v-btn>
        <v-btn icon tag="a" href="#/history" >
          <v-icon>mdi-calendar</v-icon>
          <!-- History -->
        </v-btn>
      </template>
      <template v-else>
        <v-btn icon tag="a" href="#/all-bookings" >
          <v-icon>mdi-calendar</v-icon>
          <!-- All Bookings -->
        </v-btn>
      </template>

      <v-btn icon v-if="user" @click="signOut()">
        <v-icon>mdi-logout</v-icon>
        <!-- Log out -->
      </v-btn>
      <v-btn icon tag="a" href="#/login" v-else>
        <v-icon>mdi-login</v-icon>
        <!-- Log in -->
      </v-btn>
    </v-toolbar>
    <loading-overlay v-show="isLoading">
    </loading-overlay>
    <error-overlay
      v-if="errorMessage && errorType"
      :title="errorMessage"
      @cancel="setErrorMessage($event)"
      :type="errorType">
    </error-overlay>
    <router-view></router-view>
  </v-content>
  <ConfirmModal />
</v-app>
</template>

<script>
import {mapState, mapActions, mapMutations} from 'vuex';
import Vue from 'vue';

const {formatDate, parseDate} = require('../util/formatDate');
const querystring = require('querystring');
const {fbAuth} = require('../firebase')

import LoadingOverlay from './loading-overlay.vue'
import ConfirmModal from './ConfirmModal.vue'
import ErrorOverlay from './error-overlay.vue'

export default {
  data() {
    return {
      request: {

      }
    }
  },
  mounted () {
    Vue.prototype.$confirm = (options) => {
      const promise = new Promise((resolve, reject) => {
        this.$store.commit('setModal', {
          title: options.title,
          message: options.message,
          positiveColor: 'red',
          positiveText: options.positiveText || 'OK',
          negativeText: options.negativeText || 'Cancel',
          resolve,
          reject,
        })
      })

      const dismiss = () => {
        this.$store.commit('setModal', null)
      }

      promise.then(dismiss, dismiss)
      return promise
    }
  },
  computed: {
    ...mapState(['user', 'isLoading', 'errorMessage', 'errorType', 'isAdmin',
      'trustedEmails', 'isTrusted'])
  },
  components: {
    LoadingOverlay, ErrorOverlay, ConfirmModal
  },
  methods: {
    ...mapMutations(['setErrorMessage']),
    signOut() {
      fbAuth.signOut();
      this.$router.push('/login')
    }
  }
}

</script>

<style>
.nav-part {
  max-width: 700px;
  margin: 0 auto;
}
</style>
