<script setup>
import Card from '../shared/Card.vue'
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Margins and Paddings</h1>
        <hr />
      </header>

      <section class="column overflow-horizontal gap-2 mb-3">
        <p>
          Each version has a number ranging from 0 and 5 and auto. 0 means no padding or margin for
          that direction. <br />
        </p>

        <h3>CSS Variables</h3>
        <hr />

        <p>
          Each of these variables corresponds directly to the number of the margin / padding class.
          <br />
          So <i>pl-3</i> applies the <i>--distance-3</i> as padding-left.
        </p>
        <table class="table fit-content">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>--distance-0</td>
              <td>0</td>
            </tr>
            <tr>
              <td>--distance-1</td>
              <td>0.5rem</td>
            </tr>
            <tr>
              <td>--distance-2</td>
              <td>1rem</td>
            </tr>
            <tr>
              <td>--distance-3</td>
              <td>1.5rem</td>
            </tr>
            <tr>
              <td>--distance-4</td>
              <td>2rem</td>
            </tr>
            <tr>
              <td>--distance-5</td>
              <td>2.5rem</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2">These distances are also used for the .gap classes</td>
            </tr>
          </tfoot>
        </table>

        <p>
          Responsive prefixes that you can use to apply a padding / margin only on a certain
          screensize:
        </p>
        <table class="table fit-content">
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
            Example: .mp-1, .mm-2, tp-3 etc.
          </tfoot>
        </table>

        <h4>Example:</h4>
        <table class="table fit-content">
          <thead>
            <tr>
              <th>Padding class</th>
              <th>Margin class</th>
              <th>Top</th>
              <th>Right</th>
              <th>Bottom</th>
              <th>Left</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>p-0</td>
              <td>m-0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
            </tr>
            <tr>
              <td>p-1</td>
              <td>m-1</td>
              <td>0.5rem</td>
              <td>0.5rem</td>
              <td>0.5rem</td>
              <td>0.5rem</td>
            </tr>
            <tr>
              <td>pt-auto</td>
              <td>mt-auto</td>
              <td>auto</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>pt-0</td>
              <td>mt-0</td>
              <td>0</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>pt-1</td>
              <td>mt-1</td>
              <td>0.5rem</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>pb-auto</td>
              <td>mb-auto</td>
              <td>-</td>
              <td>-</td>
              <td>auto</td>
              <td>-</td>
            </tr>
            <tr>
              <td>pb-0</td>
              <td>mb-0</td>
              <td>-</td>
              <td>-</td>
              <td>0</td>
              <td>-</td>
            </tr>
            <tr>
              <td>pb-1</td>
              <td>mb-1</td>
              <td>-</td>
              <td>-</td>
              <td>0.5rem</td>
              <td>-</td>
            </tr>
            <tr>
              <td>pl-auto</td>
              <td>ml-auto</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>auto</td>
            </tr>
            <tr>
              <td>pl-0</td>
              <td>ml-0</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>0</td>
            </tr>
            <tr>
              <td>pl-1</td>
              <td>ml-1</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>0.5rem</td>
            </tr>
            <tr>
              <td>pr-auto</td>
              <td>mr-auto</td>
              <td>-</td>
              <td>auto</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>pr-0</td>
              <td>mr-0</td>
              <td>-</td>
              <td>0</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>pr-1</td>
              <td>mr-1</td>
              <td>-</td>
              <td>0.5rem</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>px-auto</td>
              <td>mx-auto</td>
              <td>unchanged</td>
              <td>auto</td>
              <td>unchanged</td>
              <td>auto</td>
            </tr>
            <tr>
              <td>px-0</td>
              <td>mx-0</td>
              <td>unchanged</td>
              <td>0</td>
              <td>unchanged</td>
              <td>0</td>
            </tr>
            <tr>
              <td>px-1</td>
              <td>mx-1</td>
              <td>-</td>
              <td>0.5rem</td>
              <td>-</td>
              <td>0.5rem</td>
            </tr>
            <tr>
              <td>py-auto</td>
              <td>my-auto</td>
              <td>auto</td>
              <td>unchanged</td>
              <td>auto</td>
              <td>unchanged</td>
            </tr>
            <tr>
              <td>py-0</td>
              <td>my-0</td>
              <td>0</td>
              <td>unchanged</td>
              <td>0</td>
              <td>unchanged</td>
            </tr>
            <tr>
              <td>py-1</td>
              <td>my-1</td>
              <td>0.5rem</td>
              <td>-</td>
              <td>0.5rem</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>

        <h4 class="my-3">Responsive paddings and margins in action:</h4>

        <div class="column mb-5">
          <span class="mb-3">Resize the screen to see it in action:</span>
          <div class="mobile bg-danger p-3">Currently the screen is: Mobile</div>
          <div class="tablet bg-accent p-3">Currently the screen is: Tablet</div>
          <div class="desktop bg-primary p-3">Currently the screen is: Desktop</div>
        </div>

        <div class="row align-start">
          <div class="bg-primary p-1 tp-3 mp-5 f-25">
            normal padding 1 tablet padding 3 mobile padding 5
          </div>
          <div class="bg-accent p-2 f-25 ml-5 tml-3 mm-1">
            normal left margin 5, tablet left margin 3, mobile margin 1
          </div>
        </div>
      </section>
    </article>
  </Card>
</template>
