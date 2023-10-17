<template>
  <div>
    <BookingsFilter v-model="filter" />

    <table class="table" v-if="bookings">
      <thead>
        <tr>
          <th :class="{ sortable: true, 'sort-on': sort.field == 'pickupTime' }" @click="toggleSort('pickupTime')">
            Pickup Date
          </th>
          <th :class="{ sortable: true, 'sort-on': sort.field == 'createdAt' }" @click="toggleSort('createdAt')">
            Booking Date
          </th>
          <th>Patient Name</th>
          <th>Pickup / Dropoff</th>
          <th>Requester</th>
          <th>Remarks</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <booking-record-user v-for="booking in bookings" :id="booking.id" :key="booking.id" />
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
    background-color: #ddd;
  }

  tbody td {
    border-bottom: solid 1px #ccc;
  }

  th.sortable {
    cursor: pointer;
  }

  th.sort-on {
    background-color: #fff;
  }
}
</style>
<script>
import { mapState, mapActions } from "vuex";

import MyCalendar from "./MyCalendar.vue";
import BookingRecordUser from "./BookingRecordUser.vue";
import BookingsFilter from "./BookingsFilter.vue";

import { ref, orderByChild, startAt, endAt, query, off, onValue } from 'firebase/database'

const { formatDate, parseDate } = require("../util/formatDate");
const querystring = require("querystring");
const { fbDB } = require("../firebase");
const _ = require("lodash");
const dateformat = require("../util/dateformat");

export default {
  data() {
    return {
      bookings: null,
      filter: {
        dates: [new Date(), new Date()],
        filterField: "Pick-up Date",
        futureOnly: true,
      },
      sort: {
        field: "pickupTime",
        order: "desc",
      },
    };
  },
  created() {
    const boundNewBookingHandler = (this._boundNewBookingHandler = (x) => {
      this.newBookingReceived(x);
    });
    this.$watch(
      "fbRef",
      (newRef, oldRef) => {
        if (oldRef) {
          off(oldRef, "value", boundNewBookingHandler);
        }
        if (newRef) {
          onValue(newRef, boundNewBookingHandler);
        }
      },
      {
        immediate: true,
      }
    );
  },
  beforeDestroy() {
    if (this.fbRef) off(this.fbRef, "value", this._boundNewBookingHandler);
  },
  computed: {
    ...mapState(["user", "userData"]),
    userBookingRef() {
      if (this.user && this.user.uid) {
        return `/userBookings/${this.user.uid}`;
      }
    },
    fbRef() {
      if (this.userBookingRef) {
        let fbRef = ref(fbDB(), this.userBookingRef);
        let constraints = []

        if (this.filter.filterField == "Request Date") {
          constraints.push(orderByChild("createdAt"));
        } else {
          constraints.push(orderByChild("pickupTime"));
        }

        if (this.filter.futureOnly) {
          constraints.push(startAt(dateformat(new Date(), "yyyy-mm-dd")));
        } else if (
          this.filter.dates &&
          this.filter.dates[0] &&
          this.filter.dates[1]
        ) {
          const realEndDate = new Date(this.filter.dates[1].getTime());
          realEndDate.setDate(realEndDate.getDate() + 1);

          constraints.push(startAt(dateformat(this.filter.dates[0], "yyyy-mm-dd")))
          constraints.push(endAt(dateformat(realEndDate, "yyyy-mm-dd")));
        } else {

          constraints.push(startAt(dateformat(new Date(), "yyyy-mm-dd")))
          constraints.push(endAt(dateformat(new Date(), "yyyy-mm-dd")));
        }
        return query(fbRef, ...constraints);
      }
    },
  },
  components: {
    BookingsFilter,
    BookingRecordUser,
    MyCalendar,
  },
  methods: {
    ...mapActions(["loadingSpinner", "flashError"]),
    sortedBookings() {
      return (
        this.bookings &&
        _.orderBy(this.bookings, [this.sort.field], [this.sort.order])
      );
    },
    toggleSort(field) {
      if (this.sort.field == field) {
        this.sort.order = this.sort.order == "asc" ? "desc" : "asc";
      } else {
        this.sort.field = field;
      }
    },
    newBookingReceived(v) {
      this.bookings = _(v.val())
        .toPairs()
        .map(([key, value]) => ({
          ...value,
          id: key,
        }))
        .value();
    },
  },
};
</script>
