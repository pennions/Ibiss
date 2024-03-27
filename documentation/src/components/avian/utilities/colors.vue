<script setup>
import Card from '../../shared/Card.vue'
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Colors</h1>
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
              <td colspan="2"><b>Background</b></td>
            </tr>
            <tr>
              <td><code class="language-html">bg-gray-light</code></td>
              <td><div class="bg-gray-light p-1 px-3">light grey background</div></td>
            </tr>
            <tr>
              <td><code class="language-html">bg-gray </code></td>
              <td><div class="bg-gray p-1 px-3">grey background</div></td>
            </tr>
            <tr>
              <td><code class="language-html">bg-gray-dark </code></td>
              <td><div class="bg-gray-dark p-1 px-3">dark grey background</div></td>
            </tr>
            <tr>
              <td><code class="language-html">bg-black </code></td>
              <td>
                <div class="bg-black p-1 px-3">black background with auto color adjustment</div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html">bg-white </code></td>
              <td><div class="bg-white p-1 px-3">white background</div></td>
            </tr>
            <tr>
              <td><code class="language-html">bg-primary </code></td>

              <td>
                <div class="bg-primary p-1 px-3">primary background with auto color adjustment</div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html">bg-accent </code></td>

              <td>
                <div class="bg-accent p-1 px-3">accent background with auto color adjustment</div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html">bg-danger </code></td>
              <td>
                <div class="bg-danger p-1 px-3">danger background with auto color adjustment</div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html">bg-error </code></td>
              <td>
                <div class="bg-error p-1 px-3">error background with auto color adjustment</div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html">bg-warning </code></td>
              <td>
                <div class="bg-warning p-1 px-3">warning background with auto color adjustment</div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html">bg-success </code></td>
              <td>
                <div class="bg-success p-1 px-3">success background with auto color adjustment</div>
              </td>
            </tr>
            <tr>
              <td colspan="2"><b>Text</b></td>
            </tr>

            <tr>
              <td><code class="language-html">text-black </code></td>
              <td><div class="bg-primary text-black p-1 px-3">black text</div></td>
            </tr>
            <tr>
              <td><code class="language-html">text-white </code></td>
              <td><div class="bg-black text-white p-1 px-3">white text</div></td>
            </tr>
            <tr>
              <td><code class="language-html">text-primary </code></td>
              <td><div class="text-primary p-1 px-3">primary text</div></td>
            </tr>
            <tr>
              <td><code class="language-html">text-accent </code></td>
              <td><div class="bg-black text-accent p-1 px-3">accent text</div></td>
            </tr>
            <tr>
              <td><code class="language-html">text-danger </code></td>
              <td><div class="bg-accent text-danger p-1 px-3">danger text</div></td>
            </tr>
            <tr>
              <td><code class="language-html">text-success </code></td>
              <td><div class="text-success p-1 px-3">success text</div></td>
            </tr>
            <tr>
              <td><code class="language-html">text-gray </code></td>
              <td><div class="text-gray p-1 px-3">grey text</div></td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  </Card>
</template>
