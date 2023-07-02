<template>
  <v-layout align-content-start align-start row wrap>
    <v-flex sm2>
      <v-radio-group
        @change="updateParam('filterField', $event)"
        :value="value.filterField"
        label="Search by:"
      >
        <v-radio value="Request Date" label="Request Date" />
        <v-radio value="Pick-up Date" label="Pick-up Date" />
      </v-radio-group>
    </v-flex>
    <v-flex sm3>
      <v-radio-group
        @change="updateParam('futureOnly', $event)"
        :value="value.futureOnly"
        label="Date range:"
      >
        <v-radio :value="true" label="Today and future" />
        <v-radio :value="false" label="Custom date range" />
      </v-radio-group>
    </v-flex>
    <v-slide-y-transition>
      <v-flex sm4 v-if="!value.futureOnly">
        <my-calendar
          @input="updateParam('dates', $event)"
          :value="value.dates"
          :disabled="value.futureOnly"
        />
      </v-flex>
    </v-slide-y-transition>
    <v-spacer />
  </v-layout>
</template>

<script>
import MyCalendar from "./MyCalendar.vue";

export default {
  props: ["value"],
  components: {
    MyCalendar,
  },
  methods: {
    updateParam(p, $event) {
      console.log(p, $event);
      this.$emit("input", {
        ...this.value,
        [p]: $event,
      });
    },
  },
};
</script>
