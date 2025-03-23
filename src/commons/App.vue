<script lang="ts" setup>
import '@/commons/utils/datasource/source'
import '@/commons/utils/event/event'
</script>

<template>
  <div class="shj-app">
    <router-view />
  </div>
</template>

<style lang="scss" scoped>
.shj-app {
  height: 100vh;
  overflow: hidden;
}
</style>