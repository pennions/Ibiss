<script setup>
import { onMounted } from 'vue'
import Card from '../shared/Card.vue'

const buttons =
  '<button>A standard button</button>\n<button disabled>A disabled standard button</button>\n<button class=\'no-border\'>A button without a border</button>\n<button class=\'no-border\' disabled>A disabled button without a border</button>\n<button class=\'no-border outline-hover\'>A button with only an outline on hover</button>\n<button class=\'no-border outline-hover\' disabled>A disabled button with only an outline on hover</button>\n<button class=\'link\'>A link button</button>\n<button class=\'link\' disabled>A disabled link button</button>\n<button class=\'link accent\'>An accent colored link button</button>\n<button class=\'link danger\'>A danger colored link button</button>\n<button class=\'link accent\' disabled>A disabled colored link button</button>\n<button class=\'primary\'>A button with primary color</button>\n<button class=\'accent\'>A button with accent color</button>\n<button class=\'contrast\'>A button with contrast color</button>\n<button class=\'danger\'>A button with danger color</button>\n<button class=\'danger\' disabled>A disabled colored button</button>\n<button class="icon">\n <svg\n      xmlns="http://www.w3.org/2000/svg"\n      width="24"\n      height="24"\n      viewBox="0 0 24 24"\n      fill="none"\n      stroke="currentColor"\n      stroke-width="2"\n      stroke-linecap="round"\n      stroke-linejoin="round"\n      class="lucide lucide-chevron-right"\n      >\n      <path d="m9 18 6-6-6-6" />\n </svg>\n</button>\n<button\n  class="icon"\n  disabled\n>\n <svg\n      xmlns="http://www.w3.org/2000/svg"\n      width="24"\n      height="24"\n      viewBox="0 0 24 24"\n      fill="none"\n      stroke="currentColor"\n      stroke-width="2"\n      stroke-linecap="round"\n      stroke-linejoin="round"\n      class="lucide lucide-chevron-right"\n      >\n      <path d="m9 18 6-6-6-6" />\n </svg>\n</button>'

onMounted(() => {
  // eslint-disable-next-line no-undef
  Prism.highlightAll()
})
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Buttons</h1>
        <hr />
      </header>

      <section class="body column gap-5">
        <button>A standard button</button><button disabled="">A disabled standard button</button
        ><button class="no-border">A button without a border</button
        ><button class="no-border" disabled="">A disabled button without a border</button
        ><button class="no-border outline-hover">A button with only an outline on hover</button
        ><button class="no-border outline-hover" disabled="">
          A disabled button with only an outline on hover</button
        ><button class="link">A link button</button
        ><button class="link" disabled="">A disabled link button</button
        ><button class="link accent">An accent colored link button</button
        ><button class="link danger">A danger colored link button</button
        ><button class="link accent" disabled="">A disabled colored link button</button
        ><button class="primary">A button with primary color</button
        ><button class="accent">A button with accent color</button
        ><button class="contrast">A button with contrast color</button
        ><button class="danger">A button with danger color</button
        ><button class="danger" disabled="">A disabled colored button</button>
        <div>
          <p class="mb-1">Icon button</p>
          <button class="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-chevron-right"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
        <div>
          <p class="mb-1">Disabled icon button</p>
          <button class="icon" disabled="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-chevron-right"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>
      <pre class="border"><code class="language-html">{{ buttons }}</code></pre>
    </article>
  </Card>
</template>

<style scope>
button {
  max-width: fit-content;
}
</style>
