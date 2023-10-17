<template>
  <booking-record :booking="booking" :key="booking.id" :class="{
    unread: !booking.read,
    untrusted: !isTrusted(booking.contactEmail)
  }" :now="now">
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

import { mapState, mapActions } from 'vuex';
const { fbDB } = require('../firebase');
import BookingRecord from './BookingRecord.vue'
import { ref, update } from 'firebase/database'

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
      update(ref(fbDB(), `/bookings/${this.booking.id}`),
        {
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
      update(ref(fbDB(), `/bookings/${this.booking.id}`),
        {
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
      update(ref(fbDB(), `/bookings/${this.booking.id}`),
        {
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
