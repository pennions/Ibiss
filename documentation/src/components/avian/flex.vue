<script setup>
import Card from '../shared/Card.vue'
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Flex layout classes</h1>
        <hr />
      </header>

      <p>Easy to use flex-box shortcuts with additional responsive classes.</p>

      <section class="column overflow-horizontal my-5 gap-5">
        <section>
          <h3>Flex container classes</h3>
          <hr />
          <table class="no-hover">
            <thead>
              <tr>
                <th>Class</th>
                <th>Result</th>
              </tr>

              <tr>
                <td><code>row</code></td>
                <td>Sets display to flex [row is default] and applies flex-wrap: wrap</td>
              </tr>
              <tr>
                <td><code>column</code></td>
                <td>Sets display to flex and direction to column</td>
              </tr>
              <tr>
                <td><code>no-wrap</code></td>
                <td>sets flex-wrap to nowrap</td>
              </tr>
              <tr>
                <td><code>wrap-reverse</code></td>
                <td>Sets flex-wrap to reverse</td>
              </tr>
              <tr>
                <td><code>row-reverse</code></td>
                <td>Sets flex-direction to row-reverse</td>
              </tr>
              <tr>
                <td><code>column-reverse</code></td>
                <td>Sets flex-direction to column-reverse</td>
              </tr>
            </thead>
          </table>
        </section>
        <section>
          <header>
            <h3>Flex height/width classes</h3>
            <hr />
          </header>
          <p>
            The following classes can be used to set the width for row or height when column of a
            particular flex-element.
            <small class="block my-3"
              ><b>NB.</b>These do not work very well with tables, they do not adhere to these
              constraints</small
            >
          </p>
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Result</th>
                <th>415px</th>
                <th>576px</th>
                <th>768px</th>
                <th>992px</th>
                <th>1200px</th>
                <th>1400px</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>f-100</code></td>
                <td>Sets flex grow to 1, flex shrink to 1 and flex-basis to 100%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-90</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 90%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-80</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 80%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-75</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 75%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-70</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 70%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-60</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 60%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-50</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 50%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-33</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 33.33%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-30</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 30%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-25</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 25%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-20</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 20%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-16</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 16.67%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-10</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 10%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-8</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 8.33%</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>

              <tr>
                <td><code>f-auto</code></td>
                <td>
                  Sets flex grow to 1, flex shrink to 1, flex-basis to auto, min-width to auto and
                  max-width to fit-content
                </td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td><code>f-fill</code></td>
                <td>
                  Sets flex to 1 and width 100% [use this one to let an element take the remaining
                  space]
                </td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
                <td>X</td>
              </tr>
              <tr>
                <td colspan="8">
                  <b>Responsive prefixes like:</b> .mf-100, .mrow-reverse,
                  .mcolumn-reverse
                </td>
              </tr>
              <tr>
                <td>.m*</td>
                <td>-</td>
                <td>X</td>
                <td>X</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td>.t*</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>X</td>
                <td>X</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td>.d*</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>X</td>
                <td>X</td>
              </tr>
            </tbody>
          </table>
        </section>
        <div class="column mt-3">
          <span class="mb-3">Resize the screen to see it in action:</span>
          <div class="mobile bg-danger p-3">Currently the screen is: Mobile</div>
          <div class="tablet bg-accent p-3">Currently the screen is: Tablet</div>
          <div class="desktop bg-primary p-3">Currently the screen is: Desktop</div>
        </div>

        <div class="row">
          <div class="bg-primary p-2 f-25 tf-50 mf-100">
            Default flex 25, tablet flex 50, mobile flex 100
          </div>
          <div class="bg-accent p-2 f-25 tf-50 mf-100">
            Default flex 25, tablet flex 50, mobile flex 100
          </div>
          <div class="bg-danger p-2 f-25 tf-50 mf-100">
            Default flex 25, tablet flex 50, mobile flex 100
          </div>
          <div class="bg-success p-2 f-25 tf-50 mf-100">
            Default flex 25, tablet flex 50, mobile flex 100
          </div>
          <div class="bg-warning p-2 f-100 tf-50 mf-100">
            Default flex 100, tablet flex 50, mobile flex 100
          </div>
          <div class="bg-error p-2 f-100 tf-50 mf-100">
            Default flex 100, tablet flex 50, mobile flex 100
          </div>
        </div>
        <div class="row trow-reverse mrow-reverse">
          <div class="bg-primary p-2 f-50">First on desktop</div>
          <div class="bg-success p-2 f-50">First on tablet and mobile</div>
        </div>
      </section>
    </article>
  </Card>
</template>
