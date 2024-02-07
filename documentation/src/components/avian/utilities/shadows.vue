<script setup>
import Card from '../../shared/Card.vue'
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Shadows</h1>
        <hr />
      </header>
      <section>
        <table class="no-hover">
          <thead>
            <tr>
              <th>Class</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code class="language-html">shadow </code></td>
              <td><div class="shadow p-1 px-3">Element with shadow</div></td>
            </tr>
            <tr>
              <td><code class="language-html">shadow-top </code></td>
              <td><div class="shadow-top p-1 px-3">Element with shadow-top</div></td>
            </tr>
            <tr>
              <td><code class="language-html">shadow-bottom </code></td>
              <td><div class="shadow-bottom p-1 px-3">Element with shadow-bottom</div></td>
            </tr>
            <tr>
              <td><code class="language-html">shadow-left </code></td>
              <td><div class="shadow-left p-1 px-3">Element with shadow-left</div></td>
            </tr>
            <tr>
              <td><code class="language-html">shadow-right </code></td>
              <td><div class="shadow-right p-1 px-3">Element with shadow-right</div></td>
            </tr>
            <tr>
              <td colspan="2">Large variants</td>
            </tr>
            <tr>
              <td><code class="language-html">shadow-lg </code></td>
              <td><div class="shadow-lg p-1 px-3">Element with shadow</div></td>
            </tr>
            <tr>
              <td><code class="language-html">shadow-top-lg </code></td>
              <td><div class="shadow-top-lg p-1 px-3">Element with shadow-top-lg</div></td>
            </tr>
            <tr>
              <td><code class="language-html">shadow-bottom-lg </code></td>
              <td><div class="shadow-bottom-lg p-1 px-3">Element with shadow-bottom-lg</div></td>
            </tr>
            <tr>
              <td><code class="language-html">shadow-left </code></td>
              <td><div class="shadow-left-lg p-1 px-3">Element with shadow-left-lg</div></td>
            </tr>
            <tr>
              <td><code class="language-html">shadow-right </code></td>
              <td><div class="shadow-right-lg p-1 px-3">Element with shadow-right-lg</div></td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  </Card>
</template>
