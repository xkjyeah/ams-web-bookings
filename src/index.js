const Vue = require('vue/dist/vue');
const VueRouter = require('vue-router').default;
const VueX = require('vuex');
const VeeValidate = require('vee-validate');
const ElementUI = require('element-ui');
import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'

// configure language
locale.use(lang)

require('element-ui/lib/theme-default/index.css')
const App = require('./components/app.vue');

Vue.use(VueX);
Vue.use(VueRouter);
Vue.use(ElementUI);
Vue.use(VeeValidate);

const routes = [
  {path: '/', component: require('./components/make-booking.vue')},
  {path: '/history', component: require('./components/past-bookings.vue')},
  {path: '/all-bookings', component: require('./components/all-bookings.vue')},
  {path: '/login', component: require('./components/login.vue')},
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
  store: require('./store.js').default
})
