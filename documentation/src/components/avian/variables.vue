<script setup>
import Card from '../shared/Card.vue'
</script>

<template>
  <Card class="column gap-5 pb-3">
    <article>
      <header>
        <h1 class="mb-2">Variables used in Avian CSS</h1>
        <hr />
      </header>
      <p>These variables are under <code>:root { }</code></p>
      <table class="no-hover">
        <thead>
          <tr>
            <th>Variable</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>--html-background</code></td>
            <td>#faf9f8</td>
          </tr>
          <tr>
            <td><code>--background</code></td>
            <td>#fff</td>
          </tr>
          <tr>
            <td><code>--code-background</code></td>
            <td>#f3f2f1</td>
          </tr>
          <tr>
            <td><code>--overlay-background</code></td>
            <td>0, 0, 0</td>
          </tr>
          <tr>
            <td><code>--color-on-black</code></td>
            <td>#c8c6c4</td>
          </tr>

          <tr>
            <td><code>--font-color</code></td>
            <td>#323130</td>
          </tr>
          <tr>
            <td><code>--shadow-color</code></td>
            <td>0, 0, 0</td>
          </tr>
          <tr>
            <td><code>--hr-color</code></td>
            <td>#d2d0ce</td>
          </tr>
          <tr>
            <td><code>--border-color</code></td>
            <td>#8a8886</td>
          </tr>

          <tr>
            <td><code>--gray</code></td>
            <td>#a19f9d</td>
          </tr>
          <tr>
            <td><code>--color-on-gray</code></td>
            <td>#000</td>
          </tr>

          <tr>
            <td><code>--gray-dark</code></td>
            <td>#605e5c</td>
          </tr>
          <tr>
            <td><code>--color-on-gray-dark</code></td>
            <td>#faf9f8</td>
          </tr>

          <tr>
            <td><code>--gray-darker</code></td>
            <td>#8a8886</td>
          </tr>
          <tr>
            <td><code>--light</code></td>
            <td>#d2d0ce</td>
          </tr>
          <tr>
            <td><code>--black</code></td>
            <td>#000</td>
          </tr>
          <tr>
            <td><code>--white</code></td>
            <td>#fff</td>
          </tr>

          <tr>
            <td colspan="2"><b>Icons</b></td>
          </tr>
          <tr></tr>
          <tr>
            <td><code>--icon</code></td>
            <td>#605e5c</td>
          </tr>
          <tr>
            <td><code>--icon-disabled</code></td>
            <td>#a19f9d</td>
          </tr>
          <tr>
            <td><code>--icon-error</code></td>
            <td>#a80000</td>
          </tr>
          <tr>
            <td><code>--icon-success</code></td>
            <td>#107c10</td>
          </tr>
          <tr>
            <td><code>--icon-warning</code></td>
            <td>#797673</td>
          </tr>

          <tr>
            <td colspan="2"><b>Colors</b></td>
          </tr>
          <tr></tr>
          <tr>
            <td><code>--primary</code></td>
            <td>#0078d4</td>
          </tr>
          <tr>
            <td><code>--primary-hover</code></td>
            <td>#0068b8</td>
          </tr>
          <tr>
            <td><code>--color-on-primary</code></td>
            <td>#fff</td>
          </tr>

          <tr>
            <td><code>--accent</code></td>
            <td>#fce100</td>
          </tr>
          <tr>
            <td><code>--accent-hover</code></td>
            <td>#e6cf00</td>
          </tr>
          <tr>
            <td><code>--color-on-accent</code></td>
            <td>#000</td>
          </tr>

          <tr>
            <td><code>--danger</code></td>
            <td>#d13438</td>
          </tr>
          <tr>
            <td><code>--danger-hover</code></td>
            <td>#bb2a2f</td>
          </tr>
          <tr>
            <td><code>--color-on-danger</code></td>
            <td>#fff</td>
          </tr>

          <tr>
            <td><code>--warning</code></td>
            <td>#fff4ce</td>
          </tr>
          <tr>
            <td><code>--color-on-warning</code></td>
            <td>#323130</td>
          </tr>

          <tr>
            <td><code>--error</code></td>
            <td>#fde7e9</td>
          </tr>
          <tr>
            <td><code>--color-on-error</code></td>
            <td>#323130</td>
          </tr>

          <tr>
            <td><code>--success</code></td>
            <td>#dff6dd</td>
          </tr>
          <tr>
            <td><code>--color-on-success</code></td>
            <td>#323130</td>
          </tr>

          <tr>
            <td><code>--contrast</code></td>
            <td>#ccc</td>
          </tr>
          <tr>
            <td><code>--contrast-hover</code></td>
            <td>#b2b2b2</td>
          </tr>
          <tr>
            <td><code>--color-on-contrast</code></td>
            <td>#000</td>
          </tr>

          <tr>
            <td><code>--disabled</code></td>
            <td>#d2d0ce</td>
          </tr>
          <tr>
            <td><code>--color-on-disabled</code></td>
            <td>#a19f9d</td>
          </tr>

          <tr>
            <td colspan="2"><b>Inputs and buttons</b></td>
          </tr>
          <tr></tr>
          <tr>
            <td><code>--button-background</code></td>
            <td>#fff</td>
          </tr>
          <tr>
            <td><code>--button-hover</code></td>
            <td>#e1dfdd</td>
          </tr>
          <tr>
            <td><code>--button-outline-color</code></td>
            <td>#000</td>
          </tr>
          <tr>
            <td><code>--button-color</code></td>
            <td>#000</td>
          </tr>

          <tr>
            <td><code>--disabled-button-background</code></td>
            <td>#f3f2f1</td>
          </tr>
          <tr>
            <td><code>--disabled-button-color</code></td>
            <td>#a19f9d</td>
          </tr>

          <tr>
            <td><code>--colored-disabled-button-color</code></td>
            <td>#d2d0ce</td>
          </tr>

          <tr>
            <td><code>--input-border-color</code></td>
            <td>#605e5c</td>
          </tr>
          <tr>
            <td><code>--input-hover</code></td>
            <td>#c8c6c4</td>
          </tr>

          <tr>
            <td><code>--range-track-color</code></td>
            <td>#c8c6c4</td>
          </tr>
          <tr>
            <td><code>--range-filled-track-color</code></td>
            <td>#605e5c</td>
          </tr>
          <tr>
            <td><code>--range-track-hover-color</code></td>
            <td>#e0f2ff</td>
          </tr>

          <tr>
            <td><code>--switch-border-color</code></td>
            <td>#000</td>
          </tr>
          <tr>
            <td><code>--switch-toggle-off-color</code></td>
            <td>#000</td>
          </tr>
          <tr>
            <td><code>--switch-toggle-on-color</code></td>
            <td>#fff</td>
          </tr>

          <tr>
            <td colspan="2"><b>Table</b></td>
          </tr>
          <tr></tr>
          <tr>
            <td><code>--table-hover</code></td>
            <td>#e1dfdd</td>
          </tr>
          <tr>
            <td><code>--table-striped-hover</code></td>
            <td>#d2d0ce</td>
          </tr>
          <tr>
            <td><code>--table-stripe</code></td>
            <td>#edebe9</td>
          </tr>

          <tr>
            <td colspan="2"><b>Distances</b></td>
          </tr>
          <tr></tr>
          <tr>
            <td><code>--default-distance</code></td>
            <td>1.5rem</td>
          </tr>
          <tr>
            <td><code>--distance-0</code></td>
            <td>0</td>
          </tr>
          <tr>
            <td><code>--distance-1</code></td>
            <td>0.5rem</td>
          </tr>
          <tr>
            <td><code>--distance-2</code></td>
            <td>1rem</td>
          </tr>
          <tr>
            <td><code>--distance-3</code></td>
            <td>1.5rem</td>
          </tr>
          <tr>
            <td><code>--distance-4</code></td>
            <td>2rem</td>
          </tr>
          <tr>
            <td><code>--distance-5</code></td>
            <td>2.5rem</td>
          </tr>

          <tr>
            <td colspan="2"><b>Typography | 1 rem = 10 px</b></td>
          </tr>
          <tr></tr>
          <tr>
            <td><code>--h1-font-size</code></td>
            <td>3.2rem</td>
          </tr>
          <tr>
            <td><code>--h2-font-size</code></td>
            <td>3rem</td>
          </tr>
          <tr>
            <td><code>--h3-font-size</code></td>
            <td>2.8rem</td>
          </tr>
          <tr>
            <td><code>--h4-font-size</code></td>
            <td>2.6rem</td>
          </tr>
          <tr>
            <td><code>--h5-font-size</code></td>
            <td>2.4rem</td>
          </tr>
          <tr>
            <td><code>--h6-font-size</code></td>
            <td>2.2rem</td>
          </tr>
          <tr>
            <td><code>--th-font-size</code></td>
            <td>2.2rem</td>
          </tr>
          <tr>
            <td><code>--paragraph-font-size</code></td>
            <td>1.6rem</td>
          </tr>
          <tr>
            <td><code>--label-font-size</code></td>
            <td>1.6rem</td>
          </tr>
          <tr>
            <td><code>--small-font-size</code></td>
            <td>1.4rem</td>
          </tr>

          <tr>
            <td><code>--font-weight-normal</code></td>
            <td>400</td>
          </tr>
          <tr>
            <td><code>--font-weight-semibold</code></td>
            <td>600</td>
          </tr>
          <tr>
            <td><code>--font-weight-bold</code></td>
            <td>700</td>
          </tr>
        </tbody>
      </table>
    </article>
  </Card>
</template>
