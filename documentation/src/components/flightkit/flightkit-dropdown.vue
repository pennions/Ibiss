<script setup>
import { onMounted } from 'vue'
import Card from '../shared/Card.vue'

const componentCode = '<flk-dropdown>  </flk-dropdown>'
const wrapper = '<template></template>'
const example =
  '<flk-dropdown\n  text="My dropdown"\n  class="primary"\n  drawer-width="70rem"\n  right>\n  <template>\n    <ul class="p-5 test">\n      <li><a>Link 1</a></li>\n      <li><a>Link 2</a></li>\n      <li><a>Link 3</a></li>\n      <li><a>Link 4</a></li>\n      <li><a>Link 5</a></li>\n    </ul>\n  </template>\n</flk-dropdown>'

onMounted(() => {
  // eslint-disable-next-line no-undef
  Prism.highlightAll()
})
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Flightkit Dropdown</h1>
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
            <h3 class="mb-2">Using the dropdown</h3>
            <hr />

            <p class="mb-5">
              It will generate a button. Which will take any classes you give it. So all Avian
              styles can apply. <b>E.G.</b> link. You need to use a
              <code class="inline-block my-2">{{ wrapper }}</code> inside the element to make the
              content not being rendered.
            </p>

            <table class="property-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>text="My dropdown title"</code></td>
                  <td>Text to show on the button.</td>
                </tr>
                <tr>
                  <td><code>right</code></td>
                  <td>Aligns the dropdown drawer to the right (overflows to the left)</td>
                </tr>
                <tr>
                  <td><code>drawer-width="30rem"</code></td>
                  <td>Customizes the drawer width, you need to implement the unit too.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 class="mb-2">Using the dropdown</h3>
          <hr />
          <div class="row justify-between px-5">
            <flk-dropdown class="primary" text="Left dropdown" drawer-width="20rem">
              <template>
                <div class="p-2 border border-light">Dropdown on the left</div>
              </template>
            </flk-dropdown>
            <flk-dropdown text="Right dropdown" right>
              <template>
                <div class="p-5">Dropdown on the right</div>
              </template>
            </flk-dropdown>
          </div>
        </section>

        <section>
          <h3>Example</h3>
          <hr />
          <pre class="border stretch"><code class="language-html">{{ example }}</code></pre>
        </section>
      </div>
    </article>
  </Card>
</template>
