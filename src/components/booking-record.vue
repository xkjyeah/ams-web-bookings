<template>
  <tr :class="{
    'booking-record': true,
    cancelled: booking.cancelled,
  }">
    <td>
      {{dateformat(booking.pickupTime.substr(0, 10), 'dd mmm yyyy')}}
      <br/>{{booking.pickupTime.substr(11, 5)}}
    </td>
    <td>
      {{dateformat(booking.createdAt.substr(0, 10), 'dd mmm yyyy')}}
      <br/>{{booking.createdAt.substr(11, 5)}}
    </td>
    <td>
      {{booking.patientName}}
      <br/>
      {{booking.patientNric}} ({{booking.patientGender}})
      <br/><br/>
      Weight: {{booking.patientWeight}}
    </td>
    <td>
      ✓ {{booking.pickupLocation}}
      <br/>
      ✓ {{booking.dropoffLocation}}
    </td>
    <td>
      {{booking.contactPerson}}
      <br/>
      {{booking.contactPhone}}
      <br/>
      {{booking.contactEmail}}
      <br/>
      {{dateformat(booking.createdAt, "dd mmm yyyy HH:MM")}}
    </td>
    <td>
      <span v-if="booking.oxygenRate != '0'">
        ✓ Oxygen: {{booking.oxygenRate}} l/min
        <br/>
      </span>
      <span v-if="booking.twoWay != '-'">✓ Two-way<br/></span>
      <span v-else>✓ One way only<br/></span>

      <span v-if="booking.accompanyingPassengers">✓ Accompanied by {{booking.accompanyingPassengers}}<br/></span>
      <span v-if="wheelchairStatus">✓ {{wheelchairStatus}}<br/></span>
      <span v-if="booking.appointmentTime">✓ Appointment time: {{booking.appointmentTime}}<br/></span>
    </td>
    <td>
      <slot>
      </slot>
    </td>
  </tr>
</template>
<style scoped lang="scss">
.booking-record {
  &:nth-child(odd) td {
    background-color: #E0F0FF;
  }
  &:nth-child(even) td {
    background-color: #FFF;
  }
  &.untrusted td {
    background-color: #FFF0E8;
  }
}
.cancelled {
  text-decoration: line-through;
}
.unread {
  font-weight: bold;
  font-style: italic;
}
td {
  border-top: solid 1px #CCC;
}
</style>
<script>
import {mapState, mapActions} from 'vuex';
import Vue from 'vue/dist/vue';
import leftPad from 'left-pad';
const {fbDB} = require('../firebase');
const _ = require('lodash');
const dateformat = require('dateformat');

export default {
  props: ['booking'],
  data() {
    return {
      dbRef: null,
    };
  },
  computed: {
    wheelchairStatus() {
      if (this.booking && this.booking.wheelchairStretcher) {
        return ({
          'OWC': 'Use patient\'s wheelchair',
          'Stretcher': 'Stretcher required',
          'Amb WC': 'Ambulance Wheelchair required',
          '-': ''
        })[this.booking.wheelchairStretcher] || this.booking.wheelchairStatus
      }
    }
  },
  methods: {
    ...mapActions(['flashError', 'trustedEmails']),
    dateformat,
  }
}
</script>
