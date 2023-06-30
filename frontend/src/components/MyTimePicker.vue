<template>
  <v-text-field
    v-bind="$attrs"
    v-on="$listenersWithoutInput"
    type="tel"
    v-model="buffer"
    :rules="(rules || []).concat(t => checkInput(t) !== null || 'Invalid time')"
    @blur="$emit('input', checkInput(buffer)), buffer=formatTime(checkInput(buffer))"
    />
</template>

<script>
import {formatDate, parseDate} from '../util/formatDate'
import leftPad from 'left-pad'
import assert from 'assert'
import _ from 'lodash'

export default {
  props: ['value', 'rules'],
  data() {
    return {buffer: null};
  },
  created () {
    this.$listenersWithoutInput = _.omit(this.$listeners, 'input')
  },
  computed: {
    timeFormatted () {
      return this.value && [
        leftPad(this.value.getUTCHours(), 2, '0'),
        leftPad(this.value.getUTCMinutes(), 2, '0'),
      ].join(':')
    },
  },
  watch: {
    value: {
      immediate: true,
      handler (v) {
        this.buffer = this.formatTime(v)
      }
    }
  },
  methods: {
    checkInput(v) {
      try {
        const match = v.match(/([0-9]{1,2}):?([0-9]{2})/)
        if (match) {
          assert(match[1] < 24 && match[1] >= 0);
          assert(match[2] < 60 && match[2] >= 0);

          return new Date(Date.UTC(2000, 0, 0, parseInt(match[1]), parseInt(match[2])))
        } else {
          throw new Error("Time does not match pattern")
        }
      } catch (err) {
        return null
      }
    },
    formatTime (v) {
      return v && [
        leftPad(v.getUTCHours(), 2, '0'),
        leftPad(v.getUTCMinutes(), 2, '0'),
      ].join(':')
    }
  }
}
</script>
