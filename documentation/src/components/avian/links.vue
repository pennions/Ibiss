<script setup>
import { onMounted } from 'vue'
import Card from '../shared/Card.vue'

const links =
  '<a href>A standard link</a>\n<a href class="accent">An accent colored link</a>\n<a href class="danger">A danger colored link</a>\n<a href class="contrast">A contrast colored link</a>\n<a href class="button">A link as a button</a>\n<a href class="button normal">A link as normal button</a>\n<a href class="button primary">A link as primary button</a>\n<a href class="button accent">A link as accent button</a>\n<a href class="button danger">A link as danger button</a>\n<a href class="button danger disabled">A link as button with the disabled class</a>'

onMounted(() => {
  // eslint-disable-next-line no-undef
  Prism.highlightAll()
})
</script>

<template>
  <Card class="flex-100 column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Links</h1>
        <hr />
      </header>
      <section class="column gap-5 mb-5">
        <a href="">A standard link</a><a href="" class="accent">An accent colored link</a
        ><a href="" class="danger">A danger colored link</a
        ><a href="" class="contrast">A contrast colored link</a
        ><a href="" class="button">A link as a button</a
        ><a href="" class="button normal">A link as normal button</a
        ><a href="" class="button primary">A link as primary button</a
        ><a href="" class="button accent">A link as accent button</a
        ><a href="" class="button contrast">A link as contrast button</a
        ><a href="" class="button danger">A link as danger button</a
        ><a href="" class="button danger disabled">A link as button with the disabled class</a>
      </section>
      <pre class="border"><code class="language-html">{{ links }}</code></pre>
    </article>
  </Card>
</template>
<style scoped>
a {
  max-width: fit-content;
}
</style>
