<template>
<v-app>
  <v-content>
    <v-toolbar>
      <v-toolbar-title>{{user ? user.email : 'AMS Bookings'}}</v-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <template v-if="!isAdmin">
          <v-btn flat tag="a" href="#/" >
            New Booking
          </v-btn>
          <v-btn flat tag="a" href="#/history" >
            History
          </v-btn>
        </template>
        <template v-else>
          <v-btn flat tag="a" href="#/all-bookings" >
            All Bookings
          </v-btn>
        </template>

        <v-btn flat v-if="user" @click="signOut()">
          Log out
        </v-btn>
        <v-btn flat tag="a" href="#/login" v-else>
          Log in
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <loading-overlay v-show="isLoading">
    </loading-overlay>
    <error-overlay
      v-show="errorMessage"
      :title="errorMessage"
      @cancel="setErrorMessage($event)"
      :type="errorType">
    </error-overlay>
    <router-view></router-view>
  </v-content>
</v-app>
</template>

<script>
import {mapState, mapActions, mapMutations} from 'vuex';
import Vue from 'vue/dist/vue';

const {formatDate, parseDate} = require('../util/formatDate');
const querystring = require('querystring');
const {fbAuth} = require('../firebase')

import LoadingOverlay from './loading-overlay.vue'
import ErrorOverlay from './error-overlay.vue'

export default {
  data() {
    return {
      request: {

      }
    }
  },
  computed: {
    ...mapState(['user', 'isLoading', 'errorMessage', 'errorType', 'isAdmin',
      'trustedEmails', 'isTrusted'])
  },
  components: {
    LoadingOverlay, ErrorOverlay
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
