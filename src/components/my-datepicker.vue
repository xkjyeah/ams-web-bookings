<template>
  <date-picker :value="formatDate(value)" @input="$emit('input', parseDate($event))"
    format="yyyy-MM-dd"
    placeholder="yyyy-mm-dd"
    :clear-button="true">
  </date-picker>
</template>

<script>
const {formatDate, parseDate} = require('../util/formatDate');

export default {
  props: ['value'],
  components: {
    // Documentation at https://wffranco.github.io/vue-strap/#datepicker
    'date-picker': require('vue-strap/src/Datepicker.vue')
    // 'date-picker': require('vuejs-datepicker')
  },
  methods: {
    // The silly datepicker only accepts strings
    formatDate : x => formatDate(x) || '',
    parseDate: x => x ? parseDate(x) : null,
    // formatDate: x=>x,
    // parseDate: x=>x
  }
}
</script>
