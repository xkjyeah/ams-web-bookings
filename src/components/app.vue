<template>
  <main>
    <nav class="navbar navbar-default">
      <ul class="navbar-nav nav">
        <router-link active-class="active" tag="li" to="/"><a>Make a new Booking</a></router-link>
        <router-link active-class="active" tag="li" to="/history"><a>View past bookings</a></router-link>
        <li v-if="user"><a>{{user.email}}</a></li>
        <li v-if="user"><a @click="signOut()">Log out</a></li>
        <li v-else><a @click="signIn()">Log In</a></li>
      </ul>
    </nav>

    <div>
      <router-view></router-view>
    </div>
  </main>

</template>

<script>
import {mapState, mapActions} from 'vuex';
import Vue from 'vue/dist/vue';

const {formatDate, parseDate} = require('../util/formatDate');
const querystring = require('querystring');

export default {
  data() {
    return {
      request: {

      }
    }
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    ...mapActions(['signIn', 'signOut']),
    submit() {

    }
  }
}

</script>

<style>
main {
  padding: 1em;
  max-width: 700px;
  margin: 0 auto;
}
</style>
