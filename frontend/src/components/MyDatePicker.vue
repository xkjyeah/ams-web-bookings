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
      hint="DD/MM/YYYY"
      persistent-hint
      prepend-icon="event"
      v-on="$listenersWithoutInput"
      v-bind="$attrs"
      @change="$emit('input', parseDate($event))"
      :rules="
        (rules || []).concat((t) => parseDate(t) !== null || 'Invalid date')
      "
      :value="dateFormatted"
    ></v-text-field>
    <v-date-picker
      :value="formatDateYMD(value)"
      @input="$emit('input', new Date($event))"
      no-title
    ></v-date-picker>
  </v-menu>
</template>

<script>
const { formatDateYMD, parseDateMDY } = require("../util/formatDate");
import _ from "lodash";

export default {
  props: ["value", "rules"],
  data() {
    return {
      menuOpened: false,
    };
  },
  created() {
    this.$listenersWithoutInput = _.omit(this.$listeners, "input");
  },
  computed: {
    dateFormatted() {
      if (!this.value) {
        return this.value;
      } else {
        return [
          this.value.getUTCDate().toString().padStart(2, "0"),
          (this.value.getUTCMonth() + 1).toString().padStart(2, "0"),
          this.value.getUTCFullYear().toString().padStart(4, "0"),
        ].join("/");
      }
    },
  },
  methods: {
    parseDate(x) {
      return parseDateMDY(x);
    },
    formatDateYMD: (x) => (x ? formatDateYMD(x) : null),
  },
};
</script>
