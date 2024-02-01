<script setup>
import Card from '../shared/Card.vue'
</script>

<template>
  <Card class="flex-100 column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Responsive classes</h1>
        <hr />
      </header>
      <section class="column overflow-horizontal mt-5">
        <h3>Hide / show for Mobile, Tablet and Desktop layout</h3>
        <hr />

        <table>
          <thead>
            <tr>
              <th>Class</th>
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
              <td>mobile</td>
              <td>X</td>
              <td>X</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>tablet</td>
              <td>-</td>
              <td>-</td>
              <td>X</td>
              <td>X</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>desktop</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>X</td>
              <td>X</td>
            </tr>
            <tr>
              <td>small-screen</td>
              <td>X</td>
              <td>X</td>
              <td>X</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td>large-screen</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>X</td>
              <td>X</td>
              <td>X</td>
            </tr>
          </tbody>
        </table>
        <div class="column mt-3">
          <span class="mb-3">Resize the screen to see it in action:</span>
          <div class="mobile bg-danger p-3">Mobile</div>
          <div class="tablet bg-accent p-3">Tablet</div>
          <div class="desktop bg-primary p-3">desktop</div>
          <div class="small-screen bg-grey p-3">small-screen</div>
          <div class="large-screen bg-grey-dark p-3">large-screen</div>
        </div>
      </section>
    </article>
  </Card>
</template>
