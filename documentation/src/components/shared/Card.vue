<template>
  <article class="card shadow py-1 px-2 bg-white flex-100">
    <slot />
  </article>
</template>

<style scoped>
.card {
  overflow-y: auto;
  max-height: 100dvh;
}
</style>
