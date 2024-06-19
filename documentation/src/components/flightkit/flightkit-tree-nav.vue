<script setup>
import { onMounted } from 'vue'
import Card from '../shared/Card.vue'

const componentCode = '<flk-tree-nav>  </flk-tree-nav>'

onMounted(() => {
  // eslint-disable-next-line no-undef
  Prism.highlightAll()
})
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Flightkit Tree Navigation</h1>
        <hr />
      </header>
      <div class="mb-3">
        <p>
          The component is <code>{{ componentCode }}</code>
        </p>
      </div>

      <div class="column gap-5">
        <section class="column gap-3">
          <div>
            <h3 class="mb-2">Using the tree navigation</h3>
            <hr />

            <table class="property-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Function</th>
                  <th>How to use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>contents="{ stringified json }"</code></td>
                  <td>Sets the data that will create the tree navigation</td>
                  <td>Objects create depth, Arrays will be rendered as well.</td>
                </tr>

                <tr>
                  <td><code>icon-set=""</code></td>
                  <td>Sets the icon set.</td>
                  <td>Default is 'file', <b>others available:</b> 'database'</td>
                </tr>

                <tr>
                  <td><code>max-depth=""</code></td>
                  <td>Sets the maximum depth.</td>
                  <td>
                    The tree navigation will scaffold until the depth. However any values below that
                    depth are still searchable.
                  </td>
                </tr>
                <tr>
                  <td><code>filter="{ value: "", caseSensitive: false}"</code></td>
                  <td>Sets the filter for the tree.</td>
                  <td>
                    Filters the tree based on the value, default without case sensitivity.
                    <b>N.B.</b> you can also enter a string.
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3">
                    If you want to add comments, you can use the ( ) or [ ] in the title of your
                    object <code>{"Top level (with a comment)": "Value A"} </code>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
        <p>It uses url svgs. Which do not work in vue3. :(</p>
      </div>
    </article>
  </Card>
</template>
