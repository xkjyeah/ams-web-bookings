<template>
  <v-layout>
    <v-flex v-if="user && user.emailVerified" class="make-booking">
      <img src="https://www.ambulanceservice.com.sg/images/logo.png" class="logo" />

      <h1>AMS Transport Booking Form</h1>

      <v-form v-model="isFormValid">
        <section>
          <v-text-field type="email" label="Email (log out to change)" :value="user.email" :disabled="true" />

          <MyDatePicker label="Pickup Date" v-model="request.pickupDate" :rules="[rules.required]" />
          <MyTimePicker label="Pickup Time 24-hour time (00:00 for midnight, 12:00 for noon)" placeholder="e.g. 13:30"
            v-model="request.pickupTime" :rules="[rules.required]" />
          <MyTimePicker label="Appointment time at clinic/hospital (if applicable)" placeholder="e.g. 14:00"
            v-model="request.appointmentTime" />

          <h3>Pickup Location</h3>
          <PostcodeAddress label="Singapore Postcode" @address-found="request.pickupLocation = `${$event}\n`"
            :prefilledAddresses="prefilledAddresses" />

          <v-textarea label="Pickup location (please include Unit No / Ward No / Bed No)" v-model="request.pickupLocation"
            placeholder="e.g. Singapore General Hospital" :rules="[rules.required]" />

          <h3>Dropoff Location</h3>
          <PostcodeAddress label="Singapore Postcode" @address-found="request.dropoffLocation = `${$event}\n`"
            :prefilledAddresses="prefilledAddresses" />

          <v-textarea label="Destination location (please include Unit No / Ward No / Bed No)" type="text"
            v-model="request.dropoffLocation" placeholder="e.g. XYZ Nursing Home" :rules="[rules.required]" />
          <div>(Address, level / unit number, ward and bed number)</div>

          <v-radio-group v-model="request.twoWay" label="Is a return trip required? (same day only)">
            <v-radio label="Yes, return trip on the same day" value="2-way" />
            <v-radio label="No, one way only" value="-" />
          </v-radio-group>
        </section>

        <section>
          <h2>Patient Particulars</h2>
          <v-text-field label="Patient Name" type="text" v-model="request.patientName"
            placeholder="e.g. Alexander Fleming" :rules="[rules.required]" />
          <v-text-field label="Patient NRIC (last 4 digits + letter)" type="text" v-model="request.patientNric"
            placeholder="e.g. 1234X" />

          <v-radio-group label="Patient Gender" v-model="request.patientGender">
            <v-radio label="Male" value="Male" />
            <v-radio label="Female" value="Female" />
          </v-radio-group>

          <v-text-field label="Patient's estimated weight (kg)" type="text" :value="request.patientWeight === null
            ? null
            : parseInt(request.patientWeight)
            " @change="(e) => (request.patientWeight = e ? e + 'kg' : null)" placeholder="60"
            :rules="[rules.required, rules.isNumeric]" />

          <v-radio-group prop="wheelchairStretcher" label="Stretcher / Wheelchair" v-model="request.wheelchairStretcher"
            :rules="[rules.required]">
            <v-radio value="-" label="No stretcher / wheelchair required" />
            <v-radio value="Stretcher" label="Stretcher is required" />
            <v-radio value="OWC" label="Patient has his own wheelchair" />
            <v-radio value="Motorized WC" label="Patient uses motorized wheelchair" />
            <v-radio value="Ambulance WC" label="Patient requires a wheelchair from the ambulance company" />
          </v-radio-group>

          <v-textarea label="Remarks" type="text" v-model="request.precautions" />

          <v-text-field label="Oxygen flow rate (if required) (l/min)" v-model="request.oxygenRate" :step="1" :min="0"
            :max="10" type="number" />
        </section>
        <section>
          <h2>Accompanying passengers</h2>
          <v-text-field label="Name and contact of accompanying passengers, if any" type="text"
            v-model="request.accompanyingPassengers" placeholder="e.g. mother and sister, 81230000" />
        </section>
        <section>
          <h2>Particulars of requester</h2>
          <v-text-field label="Your name" type="text" v-model="request.contactPerson" placeholder="e.g. Staff Nurse Regi"
            :rules="[rules.required]" />
          <v-text-field label="Contact number" type="tel" v-model="request.contactPhone" placeholder="e.g. 61112222" />
        </section>

        <v-btn color="primary" :disabled="!isFormValid" @click="submit()">Submit Booking!</v-btn>
      </v-form>
    </v-flex>
    <v-flex v-else class="make-booking">
      You must be logged in!
      <MyLogin />
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState, mapActions } from "vuex";
import Vue from "vue";

import MyDatePicker from "./MyDatePicker.vue";
import MyTimePicker from "./MyTimePicker.vue";
import MyLogin from "./login.vue";
import PostcodeAddress from "./PostcodeAddress.vue";

const { formatDate, parseDate } = require("../util/formatDate");
const querystring = require("querystring");
const { fbDB } = require("../firebase");

import { ref, set, push, update } from 'firebase/database'

function mergeDatesToString(date, time) {
  const timeParts = [time.getUTCHours(), time.getUTCMinutes(), 0];
  return (
    [
      date.getUTCFullYear().toString().padStart(4, "0"),
      (date.getUTCMonth() + 1).toString().padStart(2, "0"),
      date.getUTCDate().toString().padStart(2, "0"),
    ].join("-") +
    " " +
    timeParts.map((x) => x.toString().padStart(2, "0")).join(":")
  );
}

function timeToString(time) {
  return [time.getUTCHours(), time.getUTCMinutes()]
    .map((x) => x.toString().padStart(2, "0"))
    .join(":");
}

const PREFILLED_ADDRESSES = [
  { short: "CGH", full: "CGH" },
  { short: "NUH", full: "NUH" },
  { short: "KTPH", full: "KTPH" },
  { short: "NTFH", full: "NTFH" },
  { short: "SGH", full: "SGH" },
  { short: "TTSH", full: "TTSH" },
  { short: "OVNH", full: "OVNH\nBranch: ?\nWd ? Bed ?" },
  { short: "Kwong Wai Shiu", full: "KWS\nBranch: ?\nWd ? Bed ?" },
  { short: "Ren Ci", full: "Ren Ci\nBranch: ?\nWd ? Bed ?" },
  { short: "BrightVision", full: "BVH\nWd ? Bed ?" },
  { short: "Econ", full: "ECON\nBranch: ?\nWd ? Bed ?" },
];

function blankRequest() {
  // Debugging only
  // return {
  //   appointmentTime: '',
  //   twoWay: '2-way',
  //   pickupLocation: 'test sgh',
  //   dropoffLocation: 'test dropoff',
  //   patientName: 'test alexander fleming',
  //   patientNric: 'test nric',
  //   patientGender: 'Male',
  //   patientWeight: '70 kg',
  //   wheelchairStretcher: 'OWC',
  //   oxygenRate: 0,
  //   accompanyingPassengers: null,
  //   contactPerson: 'Test Staff Nurse',
  //   contactPhone: '1234567',
  //
  // precautions: null,
  //   pickupDate: new Date(Date.now() + 24*60*60*1000),
  //   pickupTime: '12:00',
  // }
  return {
    appointmentTime: null,
    date: null,
    twoWay: "-",
    pickupLocation: null,
    dropoffLocation: null,
    destination: null,
    patientName: null,
    patientNric: null,
    patientGender: null,
    patientWeight: null,
    wheelchairStretcher: null,
    oxygenRate: 0,
    accompanyingPassengers: null,
    contactPerson: null,
    contactPhone: null,
    precautions: null,
    pickupDate: null,
    pickupTime: null,
  };
}

export default {
  data() {
    return {
      rules: {
        required: (v) => !!v || "Required",
        isNumeric: (v) => /^[0-9]{1,3}$/.test(v) || "Must be a number",
      },
      isFormValid: true,
      error: null,
      request: blankRequest(),
    };
  },
  computed: {
    ...mapState(["user", "userData"]),
    prefilledAddresses: () => PREFILLED_ADDRESSES,
  },
  components: {
    MyDatePicker,
    MyLogin,
    MyTimePicker,
    PostcodeAddress,
  },
  methods: {
    ...mapActions(["loadingSpinner", "flashError"]),
    submit() {
      if (this.isFormValid) {
        this.doSubmit();
      }
    },

    newBooking() {
      this.request = blankRequest();
    },

    doSubmit() {
      const pickupTimeParts = [
        this.request.pickupTime.getUTCHours(),
        this.request.pickupTime.getUTCMinutes(),
        0,
      ];
      const now = new Date();

      const data = {
        ...this.request,
        pickupDate: null,
        pickupTime: mergeDatesToString(
          this.request.pickupDate,
          this.request.pickupTime
        ),

        appointmentTime: timeToString(this.request.appointmentTime),

        createdAt:
          [
            now.getFullYear().toString().padStart(4, "0"),
            (now.getMonth() + 1).toString().padStart(2, "0"),
            now.getDate().toString().padStart(2, "0"),
          ].join("-") +
          " " +
          [
            now.getHours().toString().padStart(2, "0"),
            now.getMinutes().toString().padStart(2, "0"),
            now.getSeconds().toString().padStart(2, "0"),
          ].join(":"),

        contactEmail: this.user.email,
        // billTo: this.userData && this.userData.billTo,
      };

      const key = push(ref(fbDB(), "/bookings")).key;

      this.loadingSpinner(
        update(ref(fbDB(), '/'), {
          [`bookings/${key}`]: data,
          [`userBookings/${this.user.uid}/${key}`]: _.pick(data, [
            "createdAt",
            "pickupTime",
          ]),
        })
      )
        .then(() => {
          this.request = null;
          this.flashError({
            message: "Request received!",
            type: "success",
          });
          setTimeout(() => {
            this.$router.push("/history");
          }, 1000);
        })
        .catch((err) => {
          return this.flashError({
            ...err,
            type: "error",
          });
        })
        .then(() => {
          this.isLoading = false;
        });
    },
  },
};
</script>

<style scoped>
.make-booking {
  padding: 1em;
  max-width: 700px;
  margin: 0 auto;
}
</style>
