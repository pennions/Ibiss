<script setup>
import Card from '../shared/Card.vue'
</script>

<template>
  <Card class="flex-100 column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Display utility classes</h1>
        <hr />
      </header>
      <table class="no-hover">
        <thead>
          <tr>
            <th>Class</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>no-scroll</code></td>
            <td>Sets overflow to hidden</td>
          </tr>
          <tr>
            <td><code>text-no-wrap</code></td>
            <td>Sets whitespace to nowrap</td>
          </tr>
          <tr>
            <td><code>text-normal</code></td>
            <td>Sets the font weight to normal</td>
          </tr>
          <tr>
            <td><code>sticky</code></td>
            <td>Sets the current element to sticky with a z-index of 1000 and auto-height</td>
          </tr>
          <tr>
            <td><code>inline-block</code></td>
            <td>Sets display to inline-block</td>
          </tr>
          <tr>
            <td><code>inline-flex</code></td>
            <td>Sets display to inline-flex</td>
          </tr>
          <tr>
            <td><code>block</code></td>
            <td>Sets display to block</td>
          </tr>
          <tr>
            <td><code>fit-content</code></td>
            <td>Sets max width to fit-content</td>
          </tr>
          <tr>
            <td><code>list-style-none</code></td>
            <td>Sets the elements list style to none</td>
          </tr>
        </tbody>
      </table>
    </article>
  </Card>
</template>
