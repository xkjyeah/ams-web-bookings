<template>
  <booking-record :booking="booking" :key="booking.id"
    :class="{
      unread: !booking.read,
      untrusted: !isTrusted(booking.contactEmail)
    }"
    :now="now">
    <el-button @click="read">
      ✉
    </el-button>
    <br/>
    <el-button @click="cancel" v-if="!booking.cancelled">
      Cancel
    </el-button>
    <el-button @click="reopen" v-else>
      Uncancel
    </el-button>
  </booking-record>
</template>
<script>

import {mapState, mapActions} from 'vuex';
const {fbDB} = require('../firebase');
export default {
  props: ['booking'],
  computed: {
    ...mapState(['trustedEmails', 'isTrusted', 'now']),
  },
  components: {
    'bookingRecord': require('./booking-record.vue')
  },
  methods: {
    ...mapActions(['loadingSpinner', 'flashError']),
    read() {
      fbDB.ref(`/bookings/${this.booking.id}`)
      .update({
        read: !this.booking.read
      })
      .catch((err) => {
        this.flashError({
          ...err,
          type: 'error'
        })
      })
    },
    cancel() {
      fbDB.ref(`/bookings/${this.booking.id}`)
      .update({
        cancelled: true
      })
      .catch((err) => {
        this.flashError({
          ...err,
          type: 'error'
        })
      })
    },
    reopen() {
      fbDB.ref(`/bookings/${this.booking.id}`)
      .update({
        cancelled: false
      })
      .catch((err) => {
        this.flashError({
          ...err,
          type: 'error'
        })
      })
    }
  }
}
</script>
