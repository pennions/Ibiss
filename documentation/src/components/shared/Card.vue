<template>
  <article class="card shadow py-1 px-2 flex-fill bg-white">
    <slot />
  </article>
</template>

<style scoped>
.card {
  overflow-y: auto;
  max-height: 100dvh;
}
</style>
