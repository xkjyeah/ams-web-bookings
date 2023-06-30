<template>
  <booking-record :booking="booking" :key="booking.id"
    :class="{
      unread: !booking.read,
      untrusted: !isTrusted(booking.contactEmail)
    }"
    :now="now">
    <v-toolbar flat>
      <v-btn icon @click="read" title="Mark as read">
        <v-icon>markunread_mailbox</v-icon>
      </v-btn>
      <v-btn icon @click="cancel" title="Cancel" v-if="!booking.cancelled && !booking.cancelledByUser">
        <v-icon>delete</v-icon>
      </v-btn>
      <v-btn icon @click="reopen" title="Uncancel" v-else>
        <v-icon>restore</v-icon>
      </v-btn>
    </v-toolbar>
  </booking-record>
</template>
<script>

import {mapState, mapActions} from 'vuex';
const {fbDB} = require('../firebase');
import BookingRecord from './BookingRecord.vue'

export default {
  props: ['booking'],
  computed: {
    ...mapState(['trustedEmails', 'isTrusted', 'now']),
  },
  components: {
    BookingRecord
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
