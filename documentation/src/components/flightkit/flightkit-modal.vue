<script setup>
import { onMounted } from 'vue'
import Card from '../shared/Card.vue'

const componentCode = '<flk-modal>  </flk-modal>'
const componentDependency = '<flk-draggable>  </flk-draggable>'

onMounted(() => {
  // eslint-disable-next-line no-undef
  Prism.highlightAll()
})

function showModal() {
  document.getElementById('foo').openModal()
}
function closeModal() {
  document.getElementById('foo').closeModal()
}
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Flightkit Modal</h1>
        <hr />
      </header>
      <div class="mb-3">
        <p class="column gap-2 align-start">
          The component is <code>{{ componentCode }}</code> Dependencies:
          <code>{{ componentDependency }} </code>
        </p>
      </div>

      <div class="column gap-5">
        <section class="column gap-3">
          <div>
            <h3 class="mb-2">Using the modal</h3>
            <hr />

            <table class="property-table mb-5">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Function</th>
                  <th>How to use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>modal-title=""</code></td>
                  <td>Sets the title of the modal header</td>
                  <td><b>E.G.</b> modal-title="my modal"</td>
                </tr>
                <tr>
                  <td><code>header-class=""</code></td>
                  <td>Adds classes to the header, add multiple with a space</td>
                  <td><b>E.G.</b> header-class="foo bar baz"</td>
                </tr>
              </tbody>
            </table>

            <span class="inline-block mb-3">
              When you have the element selected like
              <code>let myModal = document.getElementById('myModal')</code> you can use the
              following functions:
            </span>

            <table class="property-table">
              <thead>
                <tr>
                  <th>Function</th>
                  <th>Parameters / Events</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>myModal.openModal(reset = true)</code></td>
                  <td>
                    If reset is <i>true [default]</i> the modal will be reset to the center. If false it will
                    appear where the user left it.
                  </td>
                  <td>Shows the modal</td>
                </tr>

                <tr>
                  <td><code>myModal.closeModal()</code></td>
                  <td></td>
                  <td>Closes the modal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 class="mb-2">Using the modal</h3>
          <hr />

          <button class="mr-3" @click="showModal">Open modal</button>
          <button @click="closeModal">Close the modal</button>

          <flk-modal id="foo" modal-title="My Modal">
            <div class="p-1">
              <h1>Modal title</h1>
              <hr />
              <section>Hello Modal!</section>
            </div>
          </flk-modal>
        </section>
      </div>
    </article>
  </Card>
</template>

<style scope>
button {
  max-width: fit-content;
}

.property-table th:first-child {
  min-width: 20rem;
}
</style>
