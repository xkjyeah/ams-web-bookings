<template>
<div>
  <v-layout align-content-start align-start row wrap>
    <v-flex sm2>
      <v-radio-group v-model="filter.filterField" label="Search by:">
        <v-radio value="Request Date" label="Request Date" />
        <v-radio value="Pick-up Date" label="Pick-up Date" />
      </v-radio-group>
    </v-flex>
    <v-flex sm2>
      <v-radio-group v-model="filter.futureOnly" label="Date range:">
        <v-radio :value="true" label="Today and future"/>
        <v-radio :value="false" label="Custom date range"/>
      </v-radio-group>
    </v-flex>
    <v-flex sm4>
      <my-calendar v-model="filter.dates" :disabled="filter.futureOnly"/>
    </v-flex>
    <v-spacer />
  </v-layout>

  <table class="table" v-if="bookings">
    <thead>
      <tr>
        <th :class="{'sortable': true, 'sort-on': sort.field == 'pickupTime' }" @click="toggleSort('pickupTime')">Pickup Date</th>
        <th :class="{'sortable': true, 'sort-on': sort.field == 'createdAt' }" @click="toggleSort('createdAt')">Booking Date</th>
        <th>Patient Name</th>
        <th>Pickup / Dropoff</th>
        <th>Requester</th>
        <th>Remarks</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <booking-record-user v-for="booking in bookings"
        :id="booking.id" :key="booking.id" />
    </tbody>
  </table>
  <i class="el-icon-loading" v-else />
</div>
</template>
<style lang="scss" scoped>
.filter-area {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
.table {
  width: 100%;
  border-collapse: collapse;
  thead th {
    background-color: #DDD;
  }
  tbody td {
    border-bottom: solid 1px #CCC;
  }

  th.sortable {
    cursor: pointer;
  }
  th.sort-on {
    background-color: #FFF;
  }
}
</style>
<script>
import {mapState, mapActions} from 'vuex';
import Vue from 'vue/dist/vue';
import leftPad from 'left-pad';

import MyCalendar from './MyCalendar.vue'
import BookingRecordUser from './BookingRecordUser.vue'

const {formatDate, parseDate} = require('../util/formatDate');
const querystring = require('querystring');
const {fbDB} = require('../firebase');
const _ = require('lodash');
const dateformat = require('../util/dateformat');

export default {
  data() {
    return {
      bookings: null,
      filter: {
        dates: [new Date(), new Date()],
        filterField: 'Pick-up Date',
        futureOnly: true,
      },
      sort: {
        field: 'pickupTime',
        order: 'desc'
      }
    }
  },
  created() {
    const boundNewBookingHandler = this._boundNewBookingHandler = (x) => {
      this.newBookingReceived(x)
    };
    this.$watch('fbRef', (newRef, oldRef) => {
      if (oldRef) {
        oldRef.off('value', boundNewBookingHandler)
      }
      if (newRef) {
        newRef.on('value', boundNewBookingHandler)
      }
    }, {
      immediate: true
    })
  },
  beforeDestroy() {
    if (this.fbRef)
      this.fbRef.off('value', this._boundNewBookingHandler);
  },
  computed: {
    ...mapState(['user', 'userData']),
    userBookingRef() {
      if (this.user && this.user.uid) {
        return `/userBookings/${this.user.uid}`
      }
    },
    fbRef() {
      if (this.userBookingRef) {
        let fbRef = fbDB.ref(this.userBookingRef)

        if (this.filter.filterField == 'Request Date') {
          fbRef = fbRef.orderByChild('createdAt')
        } else {
          fbRef = fbRef.orderByChild('pickupTime')
        }

        if (this.filter.futureOnly) {
          fbRef = fbRef.startAt(dateformat(new Date(), 'yyyy-mm-dd'))
        } else if (this.filter.dates && this.filter.dates[0] && this.filter.dates[1]) {
          const realEndDate = new Date(this.filter.dates[1].getTime());
          realEndDate.setDate(realEndDate.getDate() + 1)
          fbRef = fbRef
          .startAt(dateformat(this.filter.dates[0], 'yyyy-mm-dd'))
          .endAt(dateformat(realEndDate, 'yyyy-mm-dd'))
        } else {
          fbRef = fbRef
          .startAt(dateformat(new Date(), 'yyyy-mm-dd'))
          .endAt(dateformat(new Date(), 'yyyy-mm-dd'))
        }
        return fbRef;
      }
    }
  },
  components: {
    BookingRecordUser,
    MyCalendar,
  },
  methods: {
    ...mapActions(['loadingSpinner', 'flashError']),
    sortedBookings() {
      return this.bookings && _.orderBy(this.bookings,
        [this.sort.field],
        [this.sort.order]
      )
    },
    toggleSort(field) {
      if (this.sort.field == field) {
        this.sort.order = (this.sort.order == 'asc') ?
          'desc' : 'asc';
      } else {
        this.sort.field = field;
      }
    },
    newBookingReceived(v) {
      this.bookings = _(v.val())
        .toPairs()
        .map(([key, value]) => ({
          ...value,
          id: key
        }))
        .value()
    }
  }
}

</script>
