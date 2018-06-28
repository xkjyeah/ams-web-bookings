<template>
  <v-menu
    v-model.lazy="menuOpened"
    transition="scale-transition"
    offset-y
    full-width
    max-width="290px"
    min-width="290px"
  >
  <v-text-field
    slot="activator"
    hint="MM/DD/YYYY"
    persistent-hint
    prepend-icon="event"
    v-on="$listenersWithoutInput"
    v-bind="$attrs"
    @change="$emit('input', parseDate(dateFormatted))"
    :value="dateFormatted"
  ></v-text-field>
  <v-date-picker :value="formatDateYMD(value)" @input="$emit('input', new Date($event))"
    no-title></v-date-picker>
</v-menu>
</template>

<script>
const {formatDateYMD, parseDateMDY} = require('../util/formatDate');
import leftPad from 'left-pad'
import _ from 'lodash'

export default {
  props: ['value'],
  data () {
    return {
      menuOpened: false,
    }
  },
  created () {
    this.$listenersWithoutInput = _.omit(this.$listeners, 'input')
  },
  computed: {
    dateFormatted () {
      if (!this.value) {
        return this.value
      } else {
        return [
          leftPad(this.value.getUTCDate(), 2, '0'),
          leftPad(this.value.getUTCMonth() + 1, 2, '0'),
          leftPad(this.value.getUTCFullYear(), 4, '0'),
        ].join('/')
      }
    }
  },
  methods: {
    parseDate: x => x ? parseDate(x) : null,
    formatDateYMD: x => x ? formatDateYMD(x) : null,
  }
}
</script>
