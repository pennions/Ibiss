<script setup>
import { RouterView } from 'vue-router'
import AvianNavigation from '../components/AvianNavigation.vue'
</script>

<template>
  <main class="row gap-3">
    <AvianNavigation class="navigation f-10 shadow py-1 px-2" />
    <RouterView />
  </main>
</template>

<style scoped>
.navigation {
  height: 100dvh;
  min-width: fit-content;
}
</style>
