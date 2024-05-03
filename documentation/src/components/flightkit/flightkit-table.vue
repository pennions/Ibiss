<script setup>
import { onMounted, ref } from 'vue'
import Card from '../shared/Card.vue'
import { ardeaDataset } from '@/assets/js/ardeaDataset'

const tableComponentCode = '<flk-table>  </flk-table>'
const vanillaSetup = `window.onload = () => {\n                let ftTable = document.getElementById('ft-table');\n                ftTable.setContents(ardeaSet);\n                ftTable.init();\n      \n   })\n};`
const templateExample = '<button class="test" title="{{common_name}}">{{ common_name }}</button>'
const templatePlaceholder = '{{ common_name }}'

const customTemplates = {
  common_name: `<i>{{ common_name }}</i>`
}

const customTemplateString = `templates='{"common_name":"<button class="test" title="{{common_name}}">{{ common_name }}</button>"}'`
const htmlTemplateExample =
  '<template name="common_name"><button class="test" title="{{common_name}}">{{ common_name }}</button></template>'

const footerExample =
  '<template name="tfoot"><div class="classes are auto-added to footer">This is a footer</div></template>'
const captionExample =
  '<template name="caption"><div class="classes are auto-added to footer">This is a caption</div></template>'

onMounted(() => {
  // eslint-disable-next-line no-undef
  Prism.highlightAll()
})

const filter = ref('')
const tKey = ref(0)

function changeFilter(event) {
  filter.value = event.target.value
  tKey.value += 1
}

const result = ref('Make a selection, and see the result here')
function handleSelect(event) {
  result.value = JSON.parse(JSON.stringify(event.detail.selection))
}
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Flightkit Table</h1>
        <hr />
      </header>
      <div class="mb-3">
        <p>
          The component is <code>{{ tableComponentCode }}</code>
        </p>
      </div>

      <div class="column gap-5">
        <section class="column gap-3">
          <div>
            <h3 class="mb-2">Using the table as a vanilla webcomponent</h3>
            <hr />

            <pre class="border"><code class="language-javascript">{{ vanillaSetup }}</code></pre>

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
                  <td><code>contents=""</code></td>
                  <td>Used to set an array of objects to be displayed</td>
                  <td>
                    Either stringify a JSON object, or use the <code>setContents()</code> on the
                    element, like show above
                  </td>
                </tr>
                <tr>
                  <td><code>columns=""</code></td>
                  <td>Used to set which columns there needs to be displayed and the order.</td>
                  <td>
                    A comma separated string with the property names. <br /><b>E.G.</b>
                    "scientific_name,common_name"
                  </td>
                </tr>

                <tr>
                  <td><code>order=""</code></td>
                  <td>
                    Used to set the ordering of the rows. You can always click on one or more
                    headers to order the table
                  </td>
                  <td>
                    A comma separated string with the property names a 'pipe': | and the ordering.
                    Defaults to ascending.<br /><b>E.G.</b> "scientific_name|asc,common_name|desc"
                    or "scientific_name,common_name"
                  </td>
                </tr>

                <tr>
                  <td><code>filter=""</code></td>
                  <td>Used to do a global search on the table.</td>
                  <td>
                    a string that will be used to filter the table <br /><b>E.G.</b> "cinerea"
                  </td>
                </tr>

                <tr>
                  <td><code>templates=""</code></td>
                  <td>Ability to add templates to wrap the value in.</td>
                  <td>
                    a stringified JSON object that has a template that will be used. Use a
                    placeholder with the property like:
                    <code>{{ templatePlaceholder }}</code
                    >to use any value you want out of the row. <br /><b class="mr-1">E.G.</b>
                    <code class="language-html">{{ customTemplateString }} </code>
                  </td>
                </tr>

                <tr>
                  <td><code>selection-property=""</code></td>
                  <td>
                    When it is assigned, it will use the value to be a unique identifier for
                    creating a selection. It will render checkboxes at each table row and a select
                    all on the table head
                  </td>
                  <td>
                    a property name that has a unique value per row in a table. Emits the event
                    'select' on checkbox change. On the event parameter, there is a property
                    <i>detail</i> which has a property <i>selection</i> with the objects you
                    selected <b>E.G.</b> selection-property="id"
                  </td>
                </tr>
                <tr>
                  <td><code>e-{event}</code></td>
                  <td>builtin event handling.</td>
                  <td>
                    Will trigger on the event <b>E.G.</b> <code>e-click="myFunction"</code> will
                    trigger the global function myEvent when clicked.
                  </td>
                </tr>
                <tr>
                  <td colspan="3"><b>Functions:</b></td>
                </tr>
                <tr>
                  <td><code>setTemplates</code></td>
                  <td>Ability to add templates to wrap the value in.</td>
                  <td>
                    Add the template using the function on the element <b>E.G.</b>
                    <pre>
<code class="language-html">templatedTable.setTemplates({
      common_name: "{{ templateExample }}"
  }); </code>
</pre>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="column">
          <div>
            <h3 class="mb-2">Using html templates to customize the table.</h3>
            <hr />
            <p class="mb-4">You can use the same names like in the attribute object.</p>

            <div class="column gap-3">
              <div>
                <b>Example:</b>

                <pre><code class="language-html">{{ htmlTemplateExample }}</code></pre>
              </div>
              <div>
                <b>For footer [tfoot] / caption [caption]:</b>

                <pre><code class="language-html">{{ footerExample }}</code></pre>
                <pre><code class="language-html">{{ captionExample }}</code></pre>
                <small>You can also add these into your json string as attribute.</small>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="mb-2">Example table</h2>
          <hr />

          <div class="column gap-3 mb-3">
            <i><b>With filter and custom template:</b></i>

            <input
              class="self-align-start"
              type="text"
              placeholder="filter table"
              @keyup="changeFilter"
            />
            <flk-table
              :key="tKey"
              id="foo"
              :filter="filter"
              class="table"
              :contents="ardeaDataset"
              :templates="JSON.stringify(customTemplates)"
            ></flk-table>
          </div>

          <div class="column gap-3">
            <i><b>With selection-property:</b></i>

            <div class="row justify-between">
              <flk-table
                selection-property="scientific_name"
                class="table"
                @select="handleSelect"
                :contents="ardeaDataset"
              ></flk-table>

              <div>
                <span class="mr-5">Example function:</span>
                <code class="language-javascript">
                  function handleSelect(event) { console.log(event.detail.selection) }
                </code>
                <pre class="border p-5"><code class="language-javascript">{{ result }}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </article>
  </Card>
</template>

<style scope>
.property-table th:first-child {
  min-width: 20rem;
}
</style>
