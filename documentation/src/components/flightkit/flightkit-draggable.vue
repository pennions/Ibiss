<script setup>
import { onMounted } from 'vue'
import Card from '../shared/Card.vue'

const componentCode = '<flk-draggable>  </flk-draggable>'

onMounted(() => {
  // eslint-disable-next-line no-undef
  Prism.highlightAll()
})
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Flightkit Draggable</h1>
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
            <h3 class="mb-2">Using the draggable</h3>
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
                  <td><code>top=""</code></td>
                  <td>Sets the top position of the element</td>
                  <td>You need to add digits and the unit. <br /><b>E.G.</b> top="40%"</td>
                </tr>

                <tr>
                  <td><code>left=""</code></td>
                  <td>Sets the left position of the element</td>
                  <td>You need to add digits and the unit. <br /><b>E.G.</b> left="50%"</td>
                </tr>

                <tr>
                  <td><code>center=""</code></td>
                  <td>Sets the draggable to the center.</td>
                  <td>
                    Just adding the attribute is all you need. You can also override top / left if
                    you want, by adding the attributes.
                  </td>
                </tr>
                <tr>
                  <td><code>zIndex=""</code></td>
                  <td>Sets the zIndex of the draggable.</td>
                  <td>it will set the element.style.zIndex to the number you provided. <b>E.G.</b> zIndex="2000"</td>
                </tr>
                <tr>
                  <td><code>handle="{YourId}"</code></td>
                  <td>If you want to have a specific part of your draggable to enable drag.</td>
                  <td>It will use the id as a selector for the drag event.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </article>
  </Card>
</template>
