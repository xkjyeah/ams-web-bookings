<template>
  <div v-if="user && user.emailVerified && request" class="make-booking">
    <img src="http://www.ambulanceservice.com.sg/images/logo.png" class="logo"/>

    <h1>AMS Transport Booking Form</h1>

    <el-form :rules="formRules" :model="request" ref="formRules">
      <section>
        <el-form-item prop="email" label="Email">
          <el-input :value="user.email" :disabled="true" />
        </el-form-item>
        <el-form-item prop="pickupDate" label="Pickup Date">
          <el-date-picker v-model="request.pickupDate"
            format="dd MMM yyyy"
            type="date" />
        </el-form-item>
        <el-form-item prop="pickupTime" label="Pickup Time 24-hour time (00:00 for midnight, 12:00 for noon)">
          <el-time-select v-model="request.pickupTime"
            :picker-options="{step: '00:01'}"
            format="HH:mm"
            />
        </el-form-item>

        <el-form-item prop="appointmentTime" label="Appointment time at clinic/hospital (if applicable)">
          <el-time-select format="HH:mm" v-model="request.appointmentTime" />
        </el-form-item>


        <el-form-item prop="pickupLocation" label="Pickup location">
          <el-input type="text"
            class="form-control"
            v-model="request.pickupLocation"
            placeholder="e.g. Singapore General Hospital"/>
        </el-form-item>
        <div>(Address, level / unit number, ward and bed number)</div>

        <el-form-item prop="dropoffLocation" label="Destination location">
          <el-input type="text"
            class="form-control"
            v-model="request.dropoffLocation"
            placeholder="e.g. XYZ Nursing Home"/>
        </el-form-item>
        <div>(Address, level / unit number, ward and bed number)</div>

        <el-form-item prop="twoWay" label="Return trip required?">
          <el-switch on-text="Yes, two-way"
            off-text="No, just one-way"
            :width="150"
            :value="request.twoWay == '2-way'"
            @input="request.twoWay = $event ? '2-way' : '-'"
            />
        </el-form-item>
      </section>

      <section>
        <h2>Patient Particulars</h2>
        <el-form-item prop="patientName" label="Patient Name">
          <el-input type="text"
            class="form-control"
            v-model="request.patientName"
            placeholder="e.g. Alexander Fleming"/>
        </el-form-item>
        <el-form-item prop="patientNric" label="Patient NRIC">
          <el-input type="text"
            class="form-control"
            v-model="request.patientNric"
            placeholder="e.g. S00000001A"/>
        </el-form-item>

        <el-form-item prop="patientGender" label="Patient Gender">
          <el-radio-group v-model="request.patientGender">
            <el-radio-button label="Male">
              Male
            </el-radio-button>
            <el-radio-button label="Female">
              Female
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item prop="patientWeight" label="Patient's estimated weight">
          <el-radio-group v-model="request.patientWeight">
            <el-radio-button label="< 50kg">
              &lt; 50kg
            </el-radio-button>
            <el-radio-button label="70 kg">
              70 kg
            </el-radio-button>
            <el-radio-button label="90 kg">
              90 kg
            </el-radio-button>
            <el-radio-button label=">90 kg">
              >90 kg
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item prop="wheelchairStretcher" label="Stretcher / Wheelchair">
          <br/>
          <el-radio v-model="request.wheelchairStretcher" label="-">
            No stretcher / wheelchair required
          </el-radio>
          <br/>
          <el-radio v-model="request.wheelchairStretcher" label="Stretcher">
            Stretcher is required
          </el-radio>
          <br/>
          <el-radio v-model="request.wheelchairStretcher" label="OWC">
            Patient has his own wheelchair
          </el-radio>
          <br/>
          <el-radio v-model="request.wheelchairStretcher" label="Ambulance WC">
            Patient requires a wheelchair from the ambulance company
          </el-radio>
        </el-form-item>

        <el-form-item prop="oxygenRate" label="Oxygen flow rate (if required) (l/min)">
          <el-input-number v-model="request.oxygenRate" :step="1" :min="0" :max="10"
          show-stops :show-input="true" />
        </el-form-item>
      </section>
      <section>
        <h2>Accompanying passengers</h2>
        <el-form-item prop="accompanyingPassengers" label="Accompanying passengers, if any">
          <el-input type="text"
            class="form-control"
            v-model="request.accompanyingPassengers"
            placeholder="e.g. mother and sister, 81230000" />
        </el-form-item>
        <div>(Name and contact number)</div>
      </section>
      <section>
        <h2>Particulars of requester</h2>
        <el-form-item prop="contactPerson" label="Your name">
          <el-input type="text"
            class="form-control"
            v-model="request.contactPerson"
            placeholder="e.g. Staff Nurse Regi" />
        </el-form-item>
        <el-form-item prop="contactPhone" label="Contact number">
          <el-input type="tel"
            class="form-control"
            v-model="request.contactPhone"
            placeholder="e.g. 61112222" />
        </el-form-item>
      </section>

      <el-button type="primary" @click="submit()">Submit!</el-button>
    </el-form>
  </div>
  <div v-else-if="user && user.emailVerified && !request" class="make-booking">
    <el-button type="primary" @click="newBooking">Make a new booking</el-button>
  </div>
  <div v-else class="make-booking">
    You must be logged in!
    <my-login />
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex';
import Vue from 'vue/dist/vue';
import leftPad from 'left-pad';

const {formatDate, parseDate} = require('../util/formatDate');
const querystring = require('querystring');
const {fbDB} = require('../firebase');

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
  //   pickupDate: new Date(Date.now() + 24*60*60*1000),
  //   pickupTime: '12:00',
  // }
  return {
    appointmentTime: null,
    date: null,
    twoWay: null,
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

    pickupDate: null,
    pickupTime: null,
  }
}

export default {
  data() {
    return {
      formRules: {
        pickupTime: [
          {required: true}
        ],
        pickupDate: [
          {required: true}
        ],
        patientName: [
          {required: true}
        ],
        patientNric: [{required: true}],
        patientGender: [{required: true}],
        patientWeight: [{required: true}],
        wheelchairStretcher: [{required: true}],
        contactPerson: [{required: true}],
        contactPhone: [{required: true}],
        dropoffLocation: [
          {required: true}
        ],
        pickupLocation: [
          {required: true}
        ],
      },
      error: null,
      request: null, //blankRequest(),
    }
  },
  computed: {
    ...mapState(['user', 'userData'])
  },
  components: {
    'myLogin': require('./login.vue'),
  },
  methods: {
    ...mapActions(['loadingSpinner', 'flashError']),
    submit() {
      this.$refs.formRules.validate((valid) => {
        if (valid) {
          this.doSubmit();
        } else {
        }
      })
    },

    newBooking() {
      this.request = blankRequest();
    },

    doSubmit() {
      const pickupTimeParts = this.request.pickupTime.split(':')
        .map(x => parseInt(x))
      const now = new Date()

      const data = {
        ...this.request,
        pickupDate: null,
        pickupTime: [
          leftPad(this.request.pickupDate.getFullYear(), 4, '0'),
          leftPad(this.request.pickupDate.getMonth() + 1, 2, '0'),
          leftPad(this.request.pickupDate.getDate(), 2, '0'),
        ].join('-') + ' ' + this.request.pickupTime + ':00',

        createdAt: [
          leftPad(now.getFullYear(), 4, '0'),
          leftPad(now.getMonth() + 1, 2, '0'),
          leftPad(now.getDate(), 2, '0'),
        ].join('-') + ' ' + [
          leftPad(now.getHours(), 2, '0'),
          leftPad(now.getMinutes(), 2, '0'),
          leftPad(now.getSeconds(), 2, '0'),
        ].join(':'),

        contactEmail: this.user.email,
        // billTo: this.userData && this.userData.billTo,
      }

      const key = fbDB.ref('/bookings').push().key

      this.loadingSpinner(
        fbDB.ref().update({
          [`bookings/${key}`]: data,
          [`userBookings/${this.user.uid}/${key}`]: _.pick(data, [
            'createdAt', 'pickupTime'
          ])
        })
      )
      .then(() => {
        this.request = null;
        this.flashError({
          message: 'Request received!',
          type: 'success'
        })
      })
      .catch((err) => {
        this.flashError({
          ...err,
          type: 'error'
        })
      })
      .then(() => {
        this.isLoading = false;
      })
    }
  }
}

</script>

<style scoped>
.make-booking {
  padding: 1em;
  max-width: 700px;
  margin: 0 auto;
}
</style>
