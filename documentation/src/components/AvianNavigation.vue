<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="bg-white">
    <div class="column align-center gap-1 mb-3">
      <img src="/aviancss.svg" class="avian-logo" />

      <h1>Avian CSS</h1>
    </div>

    <nav class="font-size-18">
      <h2>Base</h2>
      <hr />
      <router-link to="/" class="pb-4">Back to Ibiss </router-link>
      <ul class="ml-0 mt-3 list-style-none">
        <li><router-link to="/aviancss">Avian CSS </router-link></li>
        <li class="ml-1"><router-link to="/typography">Typography</router-link></li>
        <li class="ml-1"><router-link to="/buttons">Buttons</router-link></li>
        <li class="ml-1"><router-link to="/links">Links</router-link></li>
        <li class="ml-1"><router-link to="/inputs">Inputs</router-link></li>
        <li class="ml-1"><router-link to="/table">Table</router-link></li>
        <li class="ml-1"><router-link to="/colors">Colors</router-link></li>
      </ul>
    </nav>
  </section>
</template>

<style scoped>
.avian-logo {
  width: 14rem;
  max-width: 14rem;
}
.router-link-exact-active {
  color: var(--color-on-contrast);
  max-width: fit-content;
  text-decoration: underline;
}
</style>
