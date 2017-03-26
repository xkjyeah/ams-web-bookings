<template>
  <div class="error-overlay" v-if="title">
    <el-alert
      :title="title"
      :type="type"
      :closable="false"
    />
  </div>
</template>
<style scoped lang="scss">
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
</style>
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
