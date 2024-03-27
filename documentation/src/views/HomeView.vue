<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="index column">
    <header class="p-5 row align-center gap-5 border-bottom bg-white">
      <img src="/ibiss.svg" class="ibiss-logo" />
      <h1>Ibiss UI Documentation</h1>
    </header>

    <section class="card-row row justify-center align-center gap-5">
      <div class="card shadow">
        <router-link to="/aviancss" class="link-card column align-center justify-around">
          <img src="/aviancss.svg" class="avian-logo" />
          <span class="normal">Go to Avian CSS</span>
        </router-link>
      </div>
      <div class="card shadow">
        <router-link to="/flightkit" class="link-card column align-center justify-around p-2">
          <img src="/flightkit.svg" class="flightkit-logo" />
          <span class="normal">Go to Flightkit Components</span>
        </router-link>
      </div>
    </section>
  </main>
</template>

<style scoped>
.ibiss-logo {
  width: 8%;
}
.avian-logo,
.flightkit-logo {
  height: 80%;
}

.image-container {
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
}

.card {
  height: 35dvh;
  width: 28rem;
  /* width: auto; */
  /* max-width: fit-content; */
  border-radius: 2rem;
  background: linear-gradient(to bottom right, rgba(0, 120, 212, 0.3), rgba(0, 120, 212, 0.15));
  transition: transform 1s ease;
}

.card a {
  text-decoration: none;
}

.normal {
  color: var(--font-color);
}

.card:hover {
  transform: scale(1.1);
  border: 1px solid var(--hr-color);
}

.card:hover a {
  text-decoration: none;
}

.card-row {
  height: 100%;
  align-self: center;
}

.link-card {
  height: 100%;
}

.index {
  height: 100dvh;
}
</style>

<style>
.navigation {
  min-height: 100dvh;
  min-width: fit-content;
  padding-bottom: 2rem;
}
</style>
