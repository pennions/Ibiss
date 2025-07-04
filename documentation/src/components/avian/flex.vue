<script setup>
import Card from '../shared/Card.vue';
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
                <th>Responsive</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>row</code></td>
                <td>Sets display to flex [row is default] and applies flex-wrap: wrap</td>
                <td>-</td>
              </tr>
              <tr>
                <td><code>column</code></td>
                <td>Sets display to flex and direction to column</td>
                <td>-</td>
              </tr>
              <tr>
                <td><code>no-wrap</code></td>
                <td>sets flex-wrap to nowrap</td>
                <td>-</td>
              </tr>
              <tr>
                <td><code>wrap-reverse</code></td>
                <td>Sets flex-wrap to reverse</td>
                <td>-</td>
              </tr>
              <tr>
                <td><code>row-reverse</code></td>
                <td>Sets flex-direction to row-reverse</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>column-reverse</code></td>
                <td>Sets flex-direction to column-reverse</td>
                <td>.m* / .t* / .d*</td>
              </tr>

              <tr>
                <td><code>gap-0</code></td>
                <td>
                  Which by default applies 0rem distance between elements [variable --distance-0]
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td><code>gap-1</code></td>
                <td>
                  Which by default applies 0.5rem distance between elements [variable --distance-1]
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td><code>gap-2</code></td>
                <td>
                  Which by default applies 1rem distance between elements [variable --distance-2]
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td><code>gap-3</code></td>
                <td>
                  Which by default applies 1.5rem distance between elements [variable --distance-3]
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td><code>gap-4</code></td>
                <td>
                  Which by default applies 2rem distance between elements [variable --distance-4]
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td><code>gap-5</code></td>
                <td>
                  Which by default applies 2.5rem distance between elements [variable --distance-5]
                </td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3>Flex alignment classes</h3>
          <hr />
          <table class="no-hover">
            <thead>
              <tr>
                <th>Class</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="2"><b>Alignment [row: y-axis, column: x-axis]</b></td>
              </tr>
              <tr>
                <td><code>align-start</code></td>
                <td>Aligns all items in the container to the start</td>
              </tr>
              <tr>
                <td><code>align-center</code></td>
                <td>Aligns all items in the container to the center</td>
              </tr>
              <tr>
                <td><code>align-end</code></td>
                <td>Aligns all items in the container to the end</td>
              </tr>
              <tr>
                <td><code>align-stretch</code></td>
                <td>
                  Stretches items in the container to take up all available space [default flex
                  behaviour]
                </td>
              </tr>
              <tr>
                <td><code>align-between</code></td>
                <td>
                  Aligns all items with evenly gaps in between without a gap in the beginning or
                  end<b>*</b>
                </td>
              </tr>
              <tr>
                <td><code>align-evenly</code></td>
                <td>
                  Aligns all items with evenly in the available space, also with even gaps in the
                  beginning or end<b>*</b>
                </td>
              </tr>
              <tr>
                <td><code>align-around</code></td>
                <td>Aligns all items with evenly in the available space<b>*</b></td>
              </tr>
              <tr>
                <td><code>self-align-start</code></td>
                <td>Aligns a flex-element to the start</td>
              </tr>
              <tr>
                <td><code>self-align-center</code></td>
                <td>Aligns a flex-element to the center</td>
              </tr>
              <tr>
                <td><code>self-align-end</code></td>
                <td>Aligns a flex-element to the end</td>
              </tr>
              <tr>
                <td><code>self-align-stretch</code></td>
                <td>Stretches a flex-element to take up all available space</td>
              </tr>
              <tr>
                <td colspan="2"><b>Alignment [row: x-axis, column: y-axis]</b></td>
              </tr>
              <tr>
                <td><code>justify-start</code></td>
                <td>Aligns all items in the container to the start</td>
              </tr>
              <tr>
                <td><code>justify-center</code></td>
                <td>Aligns all items in the container to the center</td>
              </tr>
              <tr>
                <td><code>justify-end</code></td>
                <td>Aligns all items in the container to the end</td>
              </tr>
              <tr>
                <td><code>justify-between</code></td>
                <td>
                  Aligns all items with evenly gaps in between without a gap in the beginning or end
                </td>
              </tr>
              <tr>
                <td><code>justify-evenly</code></td>
                <td>
                  Aligns all items with evenly in the available space, also with even gaps in the
                  beginning or end
                </td>
              </tr>
              <tr>
                <td><code>justify-around</code></td>
                <td>
                  Aligns all items with evenly in the available space, the gaps in the beginning or
                  end are half the size
                </td>
              </tr>
            </tbody>
            <tfoot>
              <b>*</b>
              only applies when wrap is applied and you have multiple lines. , only applies when
              wrap is applied and you have multiple lines.
            </tfoot>
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
            <small class="block my-3"><b>NB. </b>These do not work very well with tables, they do not adhere to these
              constraints</small>
          </p>
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Result</th>
                <th>Responsive</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>f-100</code></td>
                <td>Sets flex grow to 1, flex shrink to 1 and flex-basis to 100%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-90</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 90%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-80</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 80%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-75</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 75%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-70</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 70%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-60</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 60%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-50</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 50%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-33</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 33.33%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-30</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 30%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-25</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 25%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-20</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 20%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-16</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 16.67%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-10</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 10%</td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-8</code></td>
                <td>Sets flex grow to 0, flex shrink to 0 and flex-basis to 8.33%</td>
                <td>.m* / .t* / .d*</td>
              </tr>

              <tr>
                <td><code>f-auto</code></td>
                <td>
                  Sets flex grow to 1, flex shrink to 1, flex-basis to auto, min-width to auto and
                  max-width to fit-content
                </td>
                <td>.m* / .t* / .d*</td>
              </tr>
              <tr>
                <td><code>f-fill</code></td>
                <td>
                  Sets flex to 1 and width 100% [use this one to let an element take the remaining
                  space]
                </td>
                <td>.m* / .t* / .d*</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section>
          <header>
            <h3>Flex prefixes</h3>
            <hr />
          </header>
          <p>Responsive prefixes that can be used which are applied on different screensizes.</p>

          <table class="table">
            <thead>
              <tr>
                <th>Class</th>
                <th>415px</th>
                <th>576px</th>
                <th>768px</th>
                <th>992px</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>.m*</td>
                <td>X</td>
                <td>X</td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr>
                <td>.t*</td>
                <td>-</td>
                <td>-</td>
                <td>X</td>
                <td>X</td>
              </tr>
            </tbody>
            <tfoot>
              Example: .mf-100 or .mrow-reverse etc.
            </tfoot>
          </table>
          <div class="column my-5">
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

          <p class="my-3">With gap property on row</p>
          <div class="row gap-3">
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
          </div>
        </section>
      </section>
    </article>
  </Card>
</template>
