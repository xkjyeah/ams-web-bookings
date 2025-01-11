<template>
  <div>
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
        <booking-record-user
          v-for="booking in sortedBookings"
          :id="booking.id"
          :key="booking.id"
        />
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

import {
  ref,
  orderByChild,
  startAt,
  endAt,
  query,
  off,
  onValue,
} from "firebase/database";

const { formatDate, parseDate } = require("../util/formatDate");
const querystring = require("querystring");
const { fbDB } = require("../firebase");
const _ = require("lodash");
const dateformat = require("../util/dateformat");

export default {
  data() {
    return {
      bookings: {
        0: null,
        1: null,
        2: null,
      },
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
    this._destroyHandlers = { fbRefs: [] };

    this.$watch(
      "fbRefs",
      (newRefs, oldRefs) => {
        this._destroyHandlers.fbRefs.forEach((h) => h());

        if (newRefs) {
          const destroyFns = [];

          newRefs.forEach((newRef, index) => {
            const handler = (x) => this.newBookingReceived(x, index);
            onValue(newRef, handler);
            destroyFns.push(() => off(newRef, "value", handler));
          });

          this._destroyHandlers.fbRefs = destroyFns;
        }
      },
      {
        immediate: true,
      }
    );
  },
  beforeDestroy() {
    Object.values(this._destroyHandlers).forEach((handlers) => {
      handlers.forEach((h) => h());
    });
  },
  computed: {
    ...mapState(["user", "userData", "userTeamData"]),
    sortedBookings() {
      return (
        this.combinedBookings &&
        _.orderBy(this.combinedBookings, [this.sort.field], [this.sort.order])
      );
    },
    userBookingRef() {
      if (this.user && this.user.uid) {
        return `/userBookings/${this.user.uid}`;
      }
    },
    teamBookingRef() {
      if (this.userTeamData) {
        return `/teamBookings/${this.userTeamData.teamToken}`;
      }
    },
    fbRefs() {
      return [this.userBookingRef, this.teamBookingRef].filter(Boolean).map((r) => {
        let fbRef = ref(fbDB(), r);
        let constraints = [];

        if (this.filter.filterField == "Request Date") {
          constraints.push(orderByChild("createdAt"));
        } else {
          constraints.push(orderByChild("pickupTime"));
        }

        if (this.filter.futureOnly) {
          constraints.push(startAt(dateformat(new Date(), "yyyy-mm-dd")));
        } else if (this.filter.dates && this.filter.dates[0] && this.filter.dates[1]) {
          const realEndDate = new Date(this.filter.dates[1].getTime());
          realEndDate.setDate(realEndDate.getDate() + 1);

          constraints.push(startAt(dateformat(this.filter.dates[0], "yyyy-mm-dd")));
          constraints.push(endAt(dateformat(realEndDate, "yyyy-mm-dd")));
        } else {
          constraints.push(startAt(dateformat(new Date(), "yyyy-mm-dd")));
          constraints.push(endAt(dateformat(new Date(), "yyyy-mm-dd")));
        }
        return query(fbRef, ...constraints);
      });
    },
    combinedBookings() {
      return _.uniqBy(_.flatten(_.values(this.bookings).filter(Boolean)), (b) => b.id);
    },
  },
  components: {
    BookingsFilter,
    BookingRecordUser,
    MyCalendar,
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
    newBookingReceived(v, index) {
      this.bookings[index] = _(v.val())
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
