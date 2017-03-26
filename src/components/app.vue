<template>
  <main>
    <el-menu mode="horizontal" :router="true" class="nav-part">
      <template v-if="!isAdmin">
        <el-menu-item index="/"><a>Make a new Booking</a></el-menu-item>
        <el-menu-item index="/history"><a>View past bookings</a></el-menu-item>
      </template>
      <template v-else>
        <el-menu-item index="/all-bookings">All Bookings</el-menu-item>
      </template>
      <li class="el-menu-item" v-if="user">{{user.email}}</li>
      <li class="el-menu-item" v-if="user" @click="signOut()">Log out</li>
      <el-menu-item index="/login" v-if="!user">Login</el-menu-item>
    </el-menu>

    <div>
      <loading-overlay v-show="isLoading">
      </loading-overlay>
      <error-overlay v-show="errorMessage" :title="errorMessage"
        :type="errorType">
      </error-overlay>

      <router-view></router-view>
    </div>
  </main>

</template>

<script>
import {mapState, mapActions} from 'vuex';
import Vue from 'vue/dist/vue';

const {formatDate, parseDate} = require('../util/formatDate');
const querystring = require('querystring');
const {fbAuth} = require('../firebase')

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
    'loadingOverlay': require('./loading-overlay.vue'),
    'errorOverlay': require('./error-overlay.vue'),
  },
  methods: {
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
