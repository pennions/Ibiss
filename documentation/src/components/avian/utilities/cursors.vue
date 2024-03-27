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
              <td><code class="language-html">cursor-not-allowed</code></td>
              <td><div class="border p-1 px-3 cursor-not-allowed">Hover me, cursor turns to not allowed</div></td>
            </tr>
            <tr>
              <td><code class="language-html">cursor-pointer</code></td>
              <td><div class="border p-1 px-3 cursor-pointer">Hover me, cursor turns to pointer</div></td>
            </tr>
            <tr>
              <td><code class="language-html">cursor-grab</code></td>
              <td><div class="border p-1 px-3 cursor-grab">Hover me, cursor turns to grab</div></td>
            </tr>
            <tr>
              <td><code class="language-html">cursor-grabbing</code></td>
              <td><div class="border p-1 px-3 cursor-grabbing">Hover me, cursor turns to grabbing</div></td>
            </tr>
            <tr>
              <td><code class="language-html">cursor-zoom-in</code></td>
              <td>
                <div class="border p-1 px-3 cursor-zoom-in">
                  Hover me, cursor turns to magnifying glass [+]
                </div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html">cursor-zoom-out</code></td>
              <td>
                <div class="border p-1 px-3 cursor-zoom-out">
                  Hover me, cursor turns to magnifying glass [-]
                </div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html">cursor-wait</code></td>
              <td><div class="border p-1 px-3 cursor-wait">Hover me, cursor turns to spinner</div></td>
            </tr>
            <tr>
              <td><code class="language-html">cursor-help</code></td>
              <td><div class="border p-1 px-3 cursor-help">Hover me, cursor turns to help icon</div></td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  </Card>
</template>
