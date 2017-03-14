const Vue = require('vue/dist/vue');
const VueRouter = require('vue-router').default;
const VueX = require('vuex');
const App = require('./components/app.vue');

Vue.use(VueX);
Vue.use(VueRouter);

const routes = [
  {path: '/', component: require('./components/make-booking.vue')},
  {path: '/history', component: require('./components/past-bookings.vue')},
];

const {mapState, mapActions} = VueX;

Vue.component('my-radio', require('./components/my-radio.vue'));  // date picker for form
Vue.component('my-datepicker', require('./components/my-datepicker.vue'));  // date picker for form
Vue.component('my-timepicker', require('./components/my-timepicker.vue'));  // date picker for form
Vue.component('alert', require('vue-strap/src/alert.vue'));  // for displaying alert messages
Vue.component('nav-bar', require('./components/nav-bar.vue'));
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
  store: require('./store.js')
})
