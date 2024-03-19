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

      <div class="column ml-1 mb-5 gap-5">
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
        <section>
          <header>
            <h2>Text classes</h2>
            <hr />
          </header>
          <section class="row gap-5">
            <div class="f-50">
              <table class="table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Font weight</th>
                    <th>CSS Variable</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>font-weight-normal</td>
                    <td>400</td>
                    <td>--font-weight-normal</td>
                  </tr>
                  <tr>
                    <td>font-weight-semibold</td>
                    <td>600</td>
                    <td>--font-weight-semibold</td>
                  </tr>
                  <tr>
                    <td>font-weight-bold</td>
                    <td>700</td>
                    <td>--font-weight-bold</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h1 class="font-weight-normal">Header 1 with normal fontweight</h1>
              <span class="font-weight-semibold block">Text in semibold</span>
              <span class="font-weight-bold block">Text in bold</span>
            </div>

            <div class="f-50">
              <table class="table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Font size</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>font-size-68</td>
                    <td>6.8rem</td>
                  </tr>
                  <tr>
                    <td>font-size-42</td>
                    <td>4.2rem</td>
                  </tr>
                  <tr>
                    <td>font-size-32</td>
                    <td>3.2rem</td>
                  </tr>
                  <tr>
                    <td>font-size-28</td>
                    <td>2.8rem</td>
                  </tr>
                  <tr>
                    <td>font-size-24</td>
                    <td>2.4rem</td>
                  </tr>
                  <tr>
                    <td>font-size-20</td>
                    <td>2rem</td>
                  </tr>
                  <tr>
                    <td>font-size-18</td>
                    <td>1.8rem</td>
                  </tr>
                  <tr>
                    <td>font-size-14</td>
                    <td>1.4rem</td>
                  </tr>
                  <tr>
                    <td>font-size-12</td>
                    <td>1.2rem</td>
                  </tr>
                  <tr>
                    <td>font-size-10</td>
                    <td>1rem</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <span class="font-size-68 block">Size 68</span>
              <span class="font-size-42 block">Size 42</span>
              <span class="font-size-32 block">Size 32</span>
              <span class="font-size-28 block">Size 28</span>
              <span class="font-size-24 block">Size 24</span>
              <span class="font-size-20 block">Size 20</span>
              <span class="font-size-18 block">Size 18</span>
              <span class="font-size-16 block">Size 16</span>
              <span class="font-size-14 block">Size 14</span>
              <span class="font-size-12 block">Size 12</span>
              <span class="font-size-10 block">Size 10</span>
            </div>
          </section>
        </section>
      </div>
    </article>
  </Card>
</template>
