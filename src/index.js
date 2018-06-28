import Vue from 'vue/dist/vue'
const VueRouter = require('vue-router').default;
const VueX = require('vuex');
const VeeValidate = require('vee-validate');
import Vuetify from 'vuetify'

import App from './components/app.vue'

import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import '@mdi/font/css/materialdesignicons.min.css'

Vue.use(VueX);
Vue.use(VueRouter);
Vue.use(Vuetify);
Vue.use(VeeValidate);

import MakeBooking from './components/make-booking.vue'
import PastBookings from './components/past-bookings.vue'
import AllBookings from './components/all-bookings.vue'
import Login from './components/login.vue'

const routes = [
  {path: '/', component: MakeBooking},
  {path: '/history', component: PastBookings},
  {path: '/all-bookings', component: AllBookings},
  {path: '/login', component: Login},
];

const {mapState, mapActions} = VueX;

Vue.component('my-radio', require('./components/my-radio.vue'));  // date picker for form
// Vue.component('my-datepicker', require('./components/my-datepicker.vue'));  // date picker for form
// Vue.component('my-timepicker', require('./components/my-timepicker.vue'));  // date picker for form
Vue.component('loading-spinner', require('./components/loading-spinner.vue'));

new Vue({
  el: '#app',
  router: new VueRouter({
    routes
  }),
  render(h) {
    return h(App)
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    ...mapActions([
      'signIn', 'signOut'
    ])
  },
  store: require('./store.js').default
})
