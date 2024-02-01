<script setup>
import { onMounted } from 'vue'
import Card from '../shared/Card.vue'

const table =
  '<table>\n  <thead>\n    <tr>\n      <th>Column header 1</th>\n      <th>Column header 2</th>\n      <th>Column header 3</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>A</td>\n      <td>B</td>\n      <td>C</td>\n    </tr>\n    <tr>\n      <td>D</td>\n      <td>E</td>\n      <td>F</td>\n    </tr>\n    <tr>\n      <td>G</td>\n      <td>H</td>\n      <td>I</td>\n    </tr>\n  </tbody>\n  <tfoot>\n    <tr>\n      <td colspan="3">Table footer with colspan 3</td>\n    </tr>\n  </tfoot>\n</table>\n\n<table class="table">\n  <thead>\n    <tr>\n      <th>Column header 1</th>\n      <th>Column header 2</th>\n      <th>Column header 3</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>A</td>\n      <td>B</td>\n      <td>C</td>\n    </tr>\n    <tr>\n      <td>D</td>\n      <td>E</td>\n      <td>F</td>\n    </tr>\n    <tr>\n      <td>G</td>\n      <td>H</td>\n      <td>I</td>\n    </tr>\n  </tbody>\n  <tfoot>\n    <tr>\n      <td colspan="3">Table footer with colspan 3</td>\n    </tr>\n  </tfoot>\n</table>\n\n<div class="table-container" style="height: 12vh">\n  <table class="table sticky-header">\n    <thead>\n      <tr>\n        <th>Column 1</th>\n        <th>Column 2</th>\n        <th>Column 3</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td>A</td>\n        <td>B</td>\n        <td>C</td>\n      </tr>\n      <tr>\n        <td>D</td>\n        <td>E</td>\n        <td>F</td>\n      </tr>\n      <tr>\n        <td>G</td>\n        <td>H</td>\n        <td>I</td>\n      </tr>\n      <tr>\n        <td>J</td>\n        <td>K</td>\n        <td>L</td>\n      </tr>\n      <tr>\n        <td>M</td>\n        <td>N</td>\n        <td>O</td>\n      </tr>\n      <tr>\n        <td>P</td>\n        <td>Q</td>\n        <td>R</td>\n      </tr>\n      <tr>\n        <td>S</td>\n        <td>T</td>\n        <td>U</td>\n      </tr>\n      <tr>\n        <td>V</td>\n        <td>W</td>\n        <td>X</td>\n      </tr>\n      <tr>\n        <td>Y</td>\n        <td>Z</td>\n        <td>-</td>\n      </tr>\n    </tbody>\n    <tfoot>\n      <tr>\n        <td colspan="3">Table footer with colspan 3</td>\n      </tr>\n    </tfoot>\n  </table>\n</div>\n\n<table class="table striped">\n  <thead>\n    <tr>\n      <th>Column header 1</th>\n      <th>Column header 2</th>\n      <th>Column header 3</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>A</td>\n      <td>B</td>\n      <td>C</td>\n    </tr>\n    <tr>\n      <td>D</td>\n      <td>E</td>\n      <td>F</td>\n    </tr>\n    <tr>\n      <td>G</td>\n      <td>H</td>\n      <td>I</td>\n    </tr>\n  </tbody>\n</table>'

onMounted(() => {
  // eslint-disable-next-line no-undef
  Prism.highlightAll()
})
</script>

<template>
  <Card>
    <article id="table" class="column">
      <header>
        <h1>Table</h1>
        <hr />
      </header>
      <div class="body column no-stretch gap-3">
        <p>Default table</p>

        <table>
          <thead>
            <tr>
              <th>Column header 1</th>
              <th>Column header 2</th>
              <th>Column header 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A</td>
              <td>B</td>
              <td>C</td>
            </tr>
            <tr>
              <td>D</td>
              <td>E</td>
              <td>F</td>
            </tr>
            <tr>
              <td>G</td>
              <td>H</td>
              <td>I</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">Table footer with colspan 3</td>
            </tr>
          </tfoot>
        </table>

        <p>Table with the <code>no-hover</code>class:</p>
        <table class="no-hover">
          <thead>
            <tr>
              <th>Column header 1</th>
              <th>Column header 2</th>
              <th>Column header 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A</td>
              <td>B</td>
              <td>C</td>
            </tr>
            <tr>
              <td>D</td>
              <td>E</td>
              <td>F</td>
            </tr>
            <tr>
              <td>G</td>
              <td>H</td>
              <td>I</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">Table footer with colspan 3</td>
            </tr>
          </tfoot>
        </table>

        <p>A table with the <code class="language-html">table</code> class.</p>

        <table class="table">
          <thead>
            <tr>
              <th>Column header 1</th>
              <th>Column header 2</th>
              <th>Column header 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A</td>
              <td>B</td>
              <td>C</td>
            </tr>
            <tr>
              <td>D</td>
              <td>E</td>
              <td>F</td>
            </tr>
            <tr>
              <td>G</td>
              <td>H</td>
              <td>I</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">Table footer with colspan 3</td>
            </tr>
          </tfoot>
        </table>

        <p>With a sticky header:</p>

        <div class="table-container" style="height: 12vh">
          <table class="table sticky-header">
            <thead>
              <tr>
                <th>Column 1</th>
                <th>Column 2</th>
                <th>Column 3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A</td>
                <td>B</td>
                <td>C</td>
              </tr>
              <tr>
                <td>D</td>
                <td>E</td>
                <td>F</td>
              </tr>
              <tr>
                <td>G</td>
                <td>H</td>
                <td>I</td>
              </tr>
              <tr>
                <td>J</td>
                <td>K</td>
                <td>L</td>
              </tr>
              <tr>
                <td>M</td>
                <td>N</td>
                <td>O</td>
              </tr>
              <tr>
                <td>P</td>
                <td>Q</td>
                <td>R</td>
              </tr>
              <tr>
                <td>S</td>
                <td>T</td>
                <td>U</td>
              </tr>
              <tr>
                <td>V</td>
                <td>W</td>
                <td>X</td>
              </tr>
              <tr>
                <td>Y</td>
                <td>Z</td>
                <td>-</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Table footer with colspan 3</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p>
          A table with the <code class="language-html">table</code> and
          <code class="language-html">striped</code> class.
        </p>

        <table class="table striped">
          <thead>
            <tr>
              <th>Column header 1</th>
              <th>Column header 2</th>
              <th>Column header 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A</td>
              <td>B</td>
              <td>C</td>
            </tr>
            <tr>
              <td>D</td>
              <td>E</td>
              <td>F</td>
            </tr>
            <tr>
              <td>G</td>
              <td>H</td>
              <td>I</td>
            </tr>
          </tbody>
        </table>
      </div>
      <pre class="border"><code class="language-html">{{ table }}</code></pre>
    </article>
  </Card>
</template>

<style scoped>
table {
  max-width: fit-content;
}
</style>
