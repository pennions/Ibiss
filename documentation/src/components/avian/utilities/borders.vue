<script setup>
import Card from '../../shared/Card.vue'
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Borders</h1>
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
              <td colspan="2"><b>Borders</b></td>
            </tr>
            <tr>
              <td><code class="language-html"> border </code></td>
              <td><div class="border p-1 px-2">Element with border</div></td>
            </tr>
            <tr>
              <td><code class="language-html"> border-top </code></td>
              <td><div class="border-top p-1 px-2">Element with border-top</div></td>
            </tr>
            <tr>
              <td><code class="language-html"> border-bottom </code></td>
              <td><div class="border-bottom p-1 px-2">Element with border-bottom</div></td>
            </tr>
            <tr>
              <td><code class="language-html"> border-left </code></td>
              <td><div class="border-left p-1 px-2">Element with border-left</div></td>
            </tr>
            <tr>
              <td><code class="language-html"> border-right </code></td>
              <td><div class="border-right p-1 px-2">Element with border-right</div></td>
            </tr>
            <tr>
              <td colspan="2"><b>Border colors</b></td>
            </tr>
            <tr>
              <td><code class="language-html"> border-primary </code></td>
              <td>
                <div class="border border-primary p-1 px-2">
                  Element with border and border-primary
                </div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html"> border-accent </code></td>
              <td>
                <div class="border border-accent p-1 px-2">
                  Element with border and border-accent
                </div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html"> border-danger </code></td>
              <td>
                <div class="border border-danger p-1 px-2">
                  Element with border and border-danger
                </div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html"> border-success </code></td>
              <td>
                <div class="border border-success p-1 px-2">
                  Element with border and border-success
                </div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html"> border-black </code></td>
              <td>
                <div class="border border-black p-1 px-2">Element with border and border-black</div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html"> border-white </code></td>
              <td>
                <div class="bg-black p-1">
                  <div class="border border-white p-1">Element with border and border-white</div>
                </div>
              </td>
            </tr>
            <tr>
              <td><code class="language-html"> border-light </code></td>
              <td>
                <div class="border border-light p-1 px-2">Element with border and border-light</div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  </Card>
</template>
