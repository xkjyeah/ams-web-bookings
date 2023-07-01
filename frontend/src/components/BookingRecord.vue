<template>
  <tr
    :class="{
      'booking-record': true,
      cancelled: booking.cancelled || booking.cancelledByUser,
    }"
  >
    <td>
      {{ dateformat(booking.pickupTime.substr(0, 10), "dd mmm yyyy") }}
      <br />{{ booking.pickupTime.substr(11, 5) }}
    </td>
    <td>
      <span
        v-if="now"
        :title="dateformat(booking.createdAt, 'dd mmm yyyy HH:MM')"
      >
        {{ humanize(now, booking.createdAt) }}
      </span>
      <template v-else>
        {{ dateformat(booking.createdAt.substr(0, 10), "dd mmm yyyy") }}
        <br />{{ booking.createdAt.substr(11, 5) }}
      </template>
    </td>
    <td>
      {{ booking.patientName }}
      <br />
      {{ booking.patientNric }} ({{ booking.patientGender }}) <br /><br />
      Weight: {{ booking.patientWeight }}
    </td>
    <td>
      ✓ {{ booking.pickupLocation }}
      <br />
      ✓ {{ booking.dropoffLocation }}
    </td>
    <td>
      {{ booking.contactPerson }}
      <br />
      {{ booking.contactPhone }}
      <br />
      {{ booking.contactEmail }}
      <br />
      {{ dateformat(booking.createdAt, "dd mmm yyyy HH:MM") }}
    </td>
    <td>
      <span v-if="booking.oxygenRate != '0'">
        ✓ Oxygen: {{ booking.oxygenRate }} l/min
        <br />
      </span>
      <span v-if="booking.twoWay != '-'">✓ Two-way<br /></span>
      <span v-else>✓ One way only<br /></span>

      <span v-if="booking.accompanyingPassengers"
        >✓ Accompanied by {{ booking.accompanyingPassengers }}<br
      /></span>
      <span v-if="wheelchairStatus">✓ {{ wheelchairStatus }}<br /></span>
      <span v-if="booking.appointmentTime"
        >✓ Appointment time: {{ booking.appointmentTime }}<br
      /></span>
      <span v-if="booking.precautions">✓ {{ booking.precautions }}<br /></span>
    </td>
    <td>
      <em v-if="booking.cancelledByUser">(Cancelled by customer)</em><br />
      <slot> </slot>
    </td>
  </tr>
</template>
<style scoped lang="scss">
.booking-record {
  &:nth-child(odd) td {
    background-color: #e0f0ff;
  }
  &:nth-child(even) td {
    background-color: #fff;
  }
  &.untrusted td {
    background-color: #fff0e8;
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
  border-top: solid 1px #ccc;
}
</style>
<script>
import { mapState, mapActions } from "vuex";
const { fbDB } = require("../firebase");
const _ = require("lodash");
const dateformat = require("../util/dateformat");

export default {
  props: ["booking", "now"],
  data() {
    return {
      dbRef: null,
    };
  },
  computed: {
    wheelchairStatus() {
      if (this.booking && this.booking.wheelchairStretcher) {
        return (
          {
            OWC: "Use patient's wheelchair",
            Stretcher: "Stretcher required",
            "Ambulance WC": "Ambulance Wheelchair required",
            "Motorized WC": "Motorized Wheelchair",
            "-": "",
          }[this.booking.wheelchairStretcher] || this.booking.wheelchairStatus
        );
      }
    },
  },
  methods: {
    ...mapActions(["flashError", "trustedEmails"]),
    dateformat,
    humanize(now, dateStr) {
      const match = dateStr.match(
        /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2})/
      );

      if (!match || !now) {
        return "";
      }

      const dateOfDateStr = new Date(
        parseInt(match[1]),
        parseInt(match[2]) - 1,
        parseInt(match[3]),
        parseInt(match[4]),
        parseInt(match[5])
      );

      const msDiff = now.getTime() - dateOfDateStr.getTime();
      const suffix = msDiff > 0 ? "ago" : "in the future";
      const absDiff = Math.abs(msDiff);

      if (absDiff < 3600000) {
        return Math.floor(absDiff / 60000) + ` minutes ${suffix}`;
      } else if (absDiff < 24 * 3600000) {
        return Math.floor(absDiff / 3600000) + ` hours ${suffix}`;
      } else if (absDiff < 7 * 24 * 3600000) {
        return Math.floor(absDiff / (24 * 3600000)) + ` days ${suffix}`;
      } else if (absDiff < 31 * 24 * 3600000) {
        return Math.floor(absDiff / (7 * 24 * 3600000)) + ` weeks ${suffix}`;
      } else if (absDiff < 366 * 24 * 3600000) {
        return (
          Math.abs(
            now.getYear() * 12 +
              now.getMonth() -
              dateOfDateStr.getYear() * 12 -
              dateOfDateStr.getMonth()
          ) + ` months ${suffix}`
        );
      } else {
        return (
          Math.abs(now.getYear() - dateOfDateStr.getYear()) + ` years ${suffix}`
        );
      }
    },
  },
};
</script>
