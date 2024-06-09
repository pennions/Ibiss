<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
#app {
  height: 100dvh;
  /* background: linear-gradient(to bottom right, #ffffff, #f0f0f0); */
}

button {
  max-width: fit-content;
}

.property-table th:first-child {
  min-width: 20rem;
}
</style>
