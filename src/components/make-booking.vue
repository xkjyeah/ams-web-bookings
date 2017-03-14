<template>
  <div v-if="user">
    <img src="http://www.ambulanceservice.com.sg/images/logo.png" />

    <h1>AMS Transport Booking Form</h1>

    <section>
      <div>
        <label>Email</label>
        <input type="text"
          class="form-control"
          v-model="request.email"
          placeholder="e.g. john.smith@example.com"/>
      </div>
      <div>
        <label>Pickup Date and Time</label>
        24-hour time (00:00 for midnight, 12:00 for noon)
        <br/>
        <my-datepicker v-model="request.pickupDate" />
        <my-timepicker v-model="request.pickupTime" />
      </div>

      <div>
        <label>Appointment time at clinic/hospital (if applicable)</label>
        <my-timepicker v-model="request.appointmentTime" />
      </div>


      <div>
        <label>Pickup location</label>
        Address, level / unit number, ward and bed number
        <input type="text"
          class="form-control"
          v-model="request.pickupLocation"
          placeholder="e.g. Singapore General Hospital"/>
      </div>

      <div>
        <label>Destination location</label>
        Address, level / unit number, ward and bed number
        <input type="text"
          class="form-control"
          v-model="request.dropoffLocation"
          placeholder="e.g. XYZ Nursing Home"/>
      </div>

      <div>
        <label>Return trip required?</label>
        <my-radio v-model="request.twoWay" value="2-way">
          Yes
        </my-radio>
        <my-radio v-model="request.twoWay" value="-">
          No
        </my-radio>
      </div>
    </section>

    <section>
      <h2>Patient Particulars</h2>
      <div>
        <label>Patient Name</label>
        <input type="text"
          class="form-control"
          v-model="request.patientName"
          placeholder="e.g. Alexander Fleming"/>
      </div>
      <div>
        <label>Patient NRIC</label>
        <input type="text"
          class="form-control"
          v-model="request.patientNric"
          placeholder="e.g. S00000001A"/>
      </div>

      <div>
        <label>Patient Gender</label>
        <my-radio v-model="request.patientGender" value="Male">
          Male
        </my-radio>
        <my-radio v-model="request.patientGender" value="Female">
          Female
        </my-radio>
      </div>

      <div>
        <label>Patient's estimated weight</label>
        <my-radio v-model="request.patientWeight" value="< 50kg">
          &lt; 50kg
        </my-radio>
        <my-radio v-model="request.patientWeight" value="70 kg">
          70 kg
        </my-radio>
        <my-radio v-model="request.patientWeight" value="90 kg">
          90 kg
        </my-radio>
        <my-radio v-model="request.patientWeight" value=">90 kg">
          >90 kg
        </my-radio>
      </div>

      <div>
        <label>Stretcher / Wheelchair</label>
        <my-radio v-model="request.stretcherWheelchair" value="No stretcher / wheelchair required"></my-radio>
        <br/><my-radio v-model="request.stretcherWheelchair" value="Stretcher is required"></my-radio>
        <br/><my-radio v-model="request.stretcherWheelchair" value="Patient has his own wheelchair"></my-radio>
        <br/><my-radio v-model="request.stretcherWheelchair" value="Patient requires a wheelchair from the ambulance company"></my-radio>
      </div>

      <div>
        <label>Oxygen flow rate (if required)</label>
        <my-radio v-model="request.oxygenRate" value="0"></my-radio>
        <my-radio v-model="request.oxygenRate" value="1"></my-radio>
        <my-radio v-model="request.oxygenRate" value="2"></my-radio>
        <my-radio v-model="request.oxygenRate" value="3"></my-radio>
        <my-radio v-model="request.oxygenRate" value="4"></my-radio>
        <my-radio v-model="request.oxygenRate" value="5"></my-radio>
        <my-radio v-model="request.oxygenRate" value="6"></my-radio>
        <my-radio v-model="request.oxygenRate" value="7"></my-radio>
        <my-radio v-model="request.oxygenRate" value="8"></my-radio>
        <my-radio v-model="request.oxygenRate" value="9"></my-radio>
        <my-radio v-model="request.oxygenRate" value="10"></my-radio>
        l / min
      </div>
    </section>
    <section>
      <h2>Accompanying passengers</h2>
      <div>
        <label>Accompanying passengers, if any</label>
        Name and contact number
        <input type="text"
          class="form-control"
          v-model="request.accompanyingPassengers"
          placeholder="e.g. mother and sister, 81230000" />
      </div>
    </section>
    <section>
      <h2>Particulars of requester</h2>
      <div>
        <label>Your name</label>
        <input type="text"
          class="form-control"
          v-model="request.contactPerson"
          placeholder="e.g. Staff Nurse Regi" />
      </div>
      <div>
        <label>Contact number</label>
        <input type="tel"
          class="form-control"
          v-model="request.contactPhone"
          placeholder="e.g. 61112222" />
      </div>
    </section>
    <button class="btn btn-primary" @click="submit()">Submit</button>
  </div>
  <div v-else>
    You must be logged in!

    <button class="btn btn-primary" @click="signIn()">Log In</button>
  </div>
</template>
<style scoped>
label:not(.my-radio) {
  display: block;
  margin-top: 1em;
}
</style>

<script>
import {mapState, mapActions} from 'vuex';
import Vue from 'vue/dist/vue';

const {formatDate, parseDate} = require('../util/formatDate');
const querystring = require('querystring');

export default {
  data() {
    return {
      request: {
        date: null,
        twoWay: null,
        pickupLocation: null,
        destination: null,
        patientName: null,
        patientNric: null,
        patientGender: null,
        patientWeight: null,
        stretcherWheelchair: null,
        oxygenRate: null,
        accompanyingPassengers: null,
        contactPerson: null,
        contactPhone: null,
      }
    }
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    ...mapActions(['signIn']),
    submit() {

    }
  }
}

</script>
