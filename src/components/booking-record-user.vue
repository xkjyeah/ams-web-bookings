<template>
  <booking-record v-if="rec" :booking="rec">
    <el-button @click="cancel" v-if="!rec.cancelled">
      Cancel
    </el-button>
    <el-button @click="reopen" v-else>
      Uncancel
    </el-button>
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
export default {
  props: ['id'],
  components: {
    'bookingRecord': require('./booking-record.vue')
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
