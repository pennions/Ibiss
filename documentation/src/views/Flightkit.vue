<script setup>
import { RouterView } from 'vue-router'
import FlightkitNavigation from '../components/FlightkitNavigation.vue';
</script>

<template>
  <main class="row gap-3">
    <FlightkitNavigation class="navigation f-10 shadow py-1 px-2" />
    <RouterView />
  </main>
</template>

<style scoped>
.navigation {
  height: 100dvh;
  min-width: fit-content;
}
</style>
