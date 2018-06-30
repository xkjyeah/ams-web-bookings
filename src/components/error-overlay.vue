<template>
<div class="error-overlay">
  <v-alert :type="type" :value="true">{{title}}</v-alert>
</div>
</template>
<script>
export default {
  props: ['title', 'type'],
  data() {
    return {
      email: null, password: null,
    };
  },
}
</script>
<style scoped>
.error-overlay {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
}
</style>
