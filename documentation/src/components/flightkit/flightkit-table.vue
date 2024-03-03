<script setup>
import { onMounted, ref } from 'vue'
import Card from '../shared/Card.vue'
import { ardeaDataset } from '@/assets/js/ardeaDataset'

onMounted(() => {
  // eslint-disable-next-line no-undef
  Prism.highlightAll()
})

const filter = ref('')
const tKey = ref(0);

function changeFilter(event) {
  filter.value = event.target.value
  tKey.value += 1;
  console.log(filter.value)
}
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Flightkit Table</h1>
        <hr />
      </header>
      <input type="text" placeholder="filter" @keyup="changeFilter" />

      <flk-button><div>Hello</div></flk-button>

      <flk-table :key="tKey" id="foo" :filter="filter" class="table" :contents="ardeaDataset"></flk-table>
    </article>
  </Card>
</template>

<style scope>
button {
  max-width: fit-content;
}
</style>
