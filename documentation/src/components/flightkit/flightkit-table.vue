<script setup>
import { onMounted } from 'vue'
import Card from '../shared/Card.vue'
import { ardeaDataset } from '@/assets/js/ardeaDataset';

onMounted(() => {
  // eslint-disable-next-line no-undef
  Prism.highlightAll()
})
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Flightkit Table</h1>
        <hr />
      </header>

      <flk-button><div>Hello</div></flk-button>

     <my-web-component><div>Hello wc</div></my-web-component>

      <flk-table class="table"  :contents="ardeaDataset"></flk-table>
    </article>
  </Card>
</template>

<style scope>
button {
  max-width: fit-content;
}
</style>
