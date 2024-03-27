<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="bg-white">
    <div class="column align-center gap-1 mb-3 mt-1">
      <img src="/flightkit.svg" class="flightkit-logo" />

      <h1>Flightkit</h1>
    </div>

    <router-link to="/" class="block mb-2">Back to Ibiss </router-link>
    <nav class="font-size-18">
      <h2>Components</h2>
      <hr />
      <ul class="ml-0 mt-3 list-style-none">
        <li class="ml-1"><router-link to="/flightkit-table">Table</router-link></li>
        <li class="ml-1"><router-link to="/flightkit-draggable">Draggable</router-link></li>
        <li class="ml-1"><router-link to="/flightkit-modal">Modal</router-link></li>
        <li class="ml-1"><router-link to="/flightkit-dropdown">Dropdown</router-link></li>
      </ul>
    </nav>
  </section>
</template>

<style scoped>
.flightkit-logo {
  width: 14rem;
  max-width: 14rem;
}
.router-link-exact-active {
  color: var(--color-on-contrast);
  max-width: fit-content;
  text-decoration: underline;
}
</style>
