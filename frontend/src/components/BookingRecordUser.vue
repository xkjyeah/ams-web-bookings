<template>
  <booking-record v-if="rec" :booking="rec" :now="now">
    <v-toolbar flat>
      <v-btn icon @click="cancel" title="Cancel" v-if="!rec.cancelled && !rec.cancelledByUser">
        <v-icon>delete</v-icon>
      </v-btn>
      <!-- <v-btn icon @click="reopen" title="Uncancel">
        <v-icon>restore</v-icon>
      </v-btn> -->
    </v-toolbar>
  </booking-record>
  <tr v-else>
    <td colspan="4">
      <i class="el-icon-loading"></i>
    </td>
  </tr>
</template>
<script>
import {mapState, mapActions} from 'vuex';
const {fbDB} = require('../firebase');
import leftPad from 'left-pad';

import BookingRecord from './BookingRecord.vue'

export default {
  props: ['id'],
  components: {
    BookingRecord,
  },
  computed: {
    ...mapState(['now'])
  },
  data() {
    return {
      rec: null,
    }
  },
  created() {
    this.$watch('id', (id) => {
      this.dbRef = id ? fbDB.ref(`/bookings/${id}`) : null;
    }, {
      immediate: true
    })
    this.$watch('dbRef', (newRef, oldRef) => {
      if (!newRef) {
        return;
      }

      if (this._stopListening) {
        this._stopListening()
      }

      const listen = (v) => {
        this.rec = {
          ...(v.val() || {}),
          id: this.id
        };
      }

      newRef.on('value', listen);
      this._stopListening = () => newRef.off('value', listen);
    }, {
      immediate: true
    })
  },
  beforeDestroy() {
    if (this._stopListening) {
      this._stopListening()
    }
  },
  methods: {
    ...mapActions(['loadingSpinner', 'flashError']),
    async cancel() {
      if (await this.$confirm({
        title: "Are you sure you want to cancel this booking?",
        positiveColor: 'red',
        positiveText: 'Delete',
      })) {
        const now = new Date()

        fbDB.ref()
        .update({
          [`/bookings/${this.id}/cancelled`]: true,
          [`/bookings/${this.id}/cancelledByUser`]: true,
          [`/cancellations/${this.id}`]: {
            createdAt: [
              leftPad(now.getFullYear(), 4, '0'),
              leftPad(now.getMonth() + 1, 2, '0'),
              leftPad(now.getDate(), 2, '0'),
            ].join('-') + ' ' + [
              leftPad(now.getHours(), 2, '0'),
              leftPad(now.getMinutes(), 2, '0'),
              leftPad(now.getSeconds(), 2, '0'),
            ].join(':'),
          }
        })
        .catch((err) => {
          this.flashError({
            ...err,
            type: 'error'
          })
        })
      }
    },
    reopen() {
      fbDB.ref(`/bookings/${this.id}`)
      .update({
        cancelledByUser: false,
        cancelled: false,
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
