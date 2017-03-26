<template>
  <div class="loading-overlay">
    <img src="img/loading.svg" />
  </div>
</template>
<style scoped lang="scss">
.loading-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,0.5);

  img {
    width: 100%;
    max-width: 50%;
    max-height: 50%;
  }
}

</style>
<script>
export default {
}
</script>
