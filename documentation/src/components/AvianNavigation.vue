<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="bg-white">
    <div class="column align-center gap-1 mb-3">
      <img src="/aviancss.svg" class="avian-logo" />

      <h1>Avian CSS</h1>
    </div>

    <router-link to="/" class="block mb-2">Back to Ibiss </router-link>
    <nav class="font-size-18">
      <h2>Base</h2>
      <hr />
      <ul class="ml-0 mt-3 list-style-none">
        <li class="ml-1"><router-link to="/typography">Typography</router-link></li>
      </ul>
      <h3 class="mt-3">Layout</h3>
      <hr />
      <ul class="ml-0 list-style-none">
        <li class="ml-1"><router-link to="/table">Table</router-link></li>
        <li class="ml-1"><router-link to="/flex">Flex</router-link></li>
        <li class="ml-1"><router-link to="/margins-paddings">Margins and Paddings</router-link></li>
        <li class="ml-1"><router-link to="/responsive">Responsive hide/show</router-link></li>
        <li class="ml-1"><router-link to="/display-utilities">Display utilities</router-link></li>
      </ul>
      <h3 class="mt-3">Interactive</h3>
      <hr />
      <ul class="ml-0 list-style-none">
        <li class="ml-1"><router-link to="/buttons">Buttons</router-link></li>
        <li class="ml-1"><router-link to="/links">Links</router-link></li>
        <li class="ml-1"><router-link to="/inputs">Inputs</router-link></li>
      </ul>
      <h3 class="mt-3">Utilities</h3>
      <hr />
      <ul class="ml-0 list-style-none">
        <li class="ml-1"><router-link to="/icons">Icons</router-link></li>
        <li class="ml-1"><router-link to="/colors">Colors</router-link></li>
        <li class="ml-1"><router-link to="/borders">Borders</router-link></li>
        <li class="ml-1"><router-link to="/shadows">Shadows</router-link></li>
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
