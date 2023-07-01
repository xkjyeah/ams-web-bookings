<template>
  <div v-if="user">
    <BookingsFilter v-model="filter" />

    <table class="table" v-if="bookings">
      <thead>
        <tr>
          <th
            :class="{ sortable: true, 'sort-on': sort.field == 'pickupTime' }"
            @click="toggleSort('pickupTime')"
          >
            Pickup Date
          </th>
          <th
            :class="{ sortable: true, 'sort-on': sort.field == 'createdAt' }"
            @click="toggleSort('createdAt')"
          >
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
        <booking-record-admin
          v-for="booking in sortedBookings"
          :booking="booking"
          :key="booking.id"
        >
        </booking-record-admin>
      </tbody>
    </table>
    <i class="el-icon-loading" v-else />
  </div>
  <v-layout v-else>
    <my-login />
  </v-layout>
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

const { formatDate, parseDate } = require("../util/formatDate");
const querystring = require("querystring");
const { fbDB } = require("../firebase");
const _ = require("lodash");
const dateformat = require("../util/dateformat");

import BookingsFilter from "./BookingsFilter.vue";
import MyLogin from "./login.vue";
import BookingRecordAdmin from "./BookingRecordAdmin.vue";

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
        order: "asc",
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
          oldRef.off("value", boundNewBookingHandler);
        }
        if (newRef) {
          newRef.on("value", boundNewBookingHandler);
        }
      },
      {
        immediate: true,
      }
    );
  },
  beforeDestroy() {
    if (this.fbRef) this.fbRef.off("value", this._boundNewBookingHandler);
  },
  computed: {
    ...mapState(["user", "userData"]),
    sortedBookings() {
      return (
        this.bookings &&
        _.orderBy(this.bookings, [this.sort.field], [this.sort.order])
      );
    },
    fbRef() {
      let fbRef = fbDB.ref("/bookings");

      if (this.filter.filterField == "Request Date") {
        fbRef = fbRef.orderByChild("createdAt");
      } else {
        fbRef = fbRef.orderByChild("pickupTime");
      }

      if (this.filter.futureOnly) {
        fbRef = fbRef.startAt(dateformat(new Date(), "yyyy-mm-dd"));
      } else if (
        this.filter.dates &&
        this.filter.dates[0] &&
        this.filter.dates[1]
      ) {
        const realEndDate = new Date(this.filter.dates[1].getTime());
        realEndDate.setDate(realEndDate.getDate() + 1);
        fbRef = fbRef
          .startAt(dateformat(this.filter.dates[0], "yyyy-mm-dd"))
          .endAt(dateformat(realEndDate, "yyyy-mm-dd"));
      } else {
        fbRef = fbRef
          .startAt(dateformat(new Date().getTime(), "yyyy-mm-dd"))
          .endAt(dateformat(new Date().getTime(), "yyyy-mm-dd"));
      }
      return fbRef;
    },
  },
  components: {
    BookingRecordAdmin,
    BookingsFilter,
    MyLogin,
  },
  methods: {
    ...mapActions(["loadingSpinner", "flashError"]),
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
