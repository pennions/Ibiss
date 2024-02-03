<script setup>
import Card from '../shared/Card.vue'
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Typography</h1>
        <hr />
      </header>

      <div class="column ml-1 mb-5 gap-3">
        <p>
          Avian uses the following font-size, based on a 62.5% of the default font-size. <br />
          This translates to 0.1rem equals 1px.
        </p>
        <section class="row gap-5">
          <div class="f-50">
            <table class="table">
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Specified font-size</th>
                  <th>Computed pixels</th>
                  <th>CSS variable</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>h1</td>
                  <td>3.2rem</td>
                  <td>32px</td>
                  <td>--h1-font-size</td>
                </tr>
                <tr>
                  <td>h2</td>
                  <td>3.0rem</td>
                  <td>30px</td>
                  <td>--h2-font-size</td>
                </tr>
                <tr>
                  <td>h3</td>
                  <td>2.8rem</td>
                  <td>28px</td>
                  <td>--h3-font-size</td>
                </tr>
                <tr>
                  <td>h4</td>
                  <td>2.6rem</td>
                  <td>26px</td>
                  <td>--h4-font-size</td>
                </tr>
                <tr>
                  <td>h5</td>
                  <td>2.4rem</td>
                  <td>24px</td>
                  <td>--h5-font-size</td>
                </tr>
                <tr>
                  <td>h6</td>
                  <td>2.2rem</td>
                  <td>22px</td>
                  <td>--h6-font-size</td>
                </tr>
                <tr>
                  <td>label</td>
                  <td>1.6rem</td>
                  <td>16px</td>
                  <td>--label-font-size</td>
                </tr>
                <tr>
                  <td>small</td>
                  <td>1.2rem</td>
                  <td>14px</td>
                  <td>--small-font-size</td>
                </tr>
                <tr>
                  <td>p</td>
                  <td>1.6rem</td>
                  <td>16px</td>
                  <td>--paragraph-font-size</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h1>Header 1</h1>
            <h2>Header 2</h2>
            <h3>Header 3</h3>
            <h4>Header 4</h4>
            <h5>Header 5</h5>
            <h6>Header 6</h6>
            <label>label</label> <br /><small>small</small>
            <p>Normal text in a paragraph</p>
          </div>
        </section>

        <section>
          <header>
            <h2>Other text elements</h2>
            <hr />
          </header>
          <section class="row">
            <table class="table f-50">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>abbr</code></td>
                  <td><abbr title="Abbreviation">Abbr.</abbr></td>
                </tr>
                <tr>
                  <td class="row gap-1"><code>strong</code><code>b</code></td>
                  <td><strong>Bold</strong></td>
                </tr>
                <tr>
                  <td class="row gap-1"><code>i</code><code>em</code><code>cite</code></td>
                  <td><em>Italic</em></td>
                </tr>
                <tr>
                  <td><code>del</code></td>
                  <td><del>Deleted</del></td>
                </tr>
                <tr>
                  <td><code>ins</code></td>
                  <td><ins>Inserted</ins></td>
                </tr>
                <tr>
                  <td class="row gap-1"><code>kbd</code><code>code</code></td>
                  <td><kbd>Ctrl + S</kbd></td>
                </tr>
                <tr>
                  <td><code>mark</code></td>
                  <td><mark>Highlighted</mark></td>
                </tr>
                <tr>
                  <td><code>strike</code><code>s</code></td>
                  <td><s>Strikethrough</s></td>
                </tr>
                <tr>
                  <td><code>small</code></td>
                  <td><small>Small </small></td>
                </tr>
                <tr>
                  <td><code>sub</code></td>
                  <td>Text <sub>sub</sub></td>
                </tr>
                <tr>
                  <td><code>sup</code></td>
                  <td>Text <sup>sup</sup></td>
                </tr>
                <tr>
                  <td><code>u</code></td>
                  <td><u>Underline</u></td>
                </tr>
              </tbody>
            </table>
          </section>
        </section>
      </div>
    </article>
  </Card>
</template>
