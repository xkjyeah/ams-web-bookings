<template>
  <label class="btn my-radio"
      :class="{
        active: value==checked,
        'btn-primary': value==checked,
        'btn-default': value!=checked,
      }">
    <input type="radio" :value="value" @input="emitValue"
      :checked="value == checked" @change="emitValue" />
    <slot>{{value}}</slot>
  </label>
</template>
<script>
export default {
  props: ['value', 'checked'],
  model: {
    prop: 'checked',
    event: 'change'
  },
  methods: {
    emitValue() {
      this.$emit('change', this.value);
    }
  }
}
</script>
<style lang="scss">
</style>
