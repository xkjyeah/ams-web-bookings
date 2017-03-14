<template>
  <span class="form-inline">
  <input type="text" @change.lazy="checkInput"
    v-model="buffer" placeholder="hh:mm" class="form-control" />
  </span>
</template>

<script>
const {formatDate, parseDate} = require('../util/formatDate');
const leftPad = require('left-pad');
const assert = require('assert');

export default {
  props: ['value'],
  watch: {
    value(value) {
      this.buffer = value;
    },
  },
  data() {
    return {buffer: null};
  },
  components: {
    // Documentation at https://wffranco.github.io/vue-strap/#datepicker
    'date-picker': require('vue-strap/src/Datepicker.vue')
    // 'date-picker': require('vuejs-datepicker')
  },
  methods: {
    checkInput() {
      try {
        const match = this.buffer.match(/([0-9]{1,2}):?([0-9]{2})/)
        if (match) {
          assert(match[1] < 24 && match[1] >= 0);
          assert(match[2] < 60 && match[2] >= 0);

          this.buffer = leftPad(match[1], 2, '0') + ':' +
            leftPad(match[2], 2, '0');
          this.$emit('input', buffer)
        } else {
          throw new Error();
        }
      } catch (err) {
        this.$emit('input', null)
      }


    }
  }
}
</script>
