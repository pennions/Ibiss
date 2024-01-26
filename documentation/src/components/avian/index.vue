<script setup>
import Card from '../shared/Card.vue'
</script>

<template>
  <Card class="flex-100 column gap-5">
    <section>
      <h1>Welcome!</h1>
      <p>
        I have written this style system so you can quickly make any webpage look consistent and
        good without having an overkill on features.
        Keeping its footprint low. And I separated theming. Which means colors, borders,
        box-shadows, fonts and the like can be adjusted super easy.
      </p>
    </section>
    <section>
      <h2>Features</h2>
      <ul>
        <li>Out-of-the-box responsive, using flex-box</li>
        <li>Based on Microsoft Fluent Design.</li>
        <li>Allows for easy theming.</li>
        <li>Built with Less, so you can easily run and modify inside a webbrowser.</li>
      </ul>
    </section>
    <section>
      <h2>Goal</h2>
      <p>
        My goal is to make the life of fullstack webapplication developers easier by providing a lot
        of things out-of-the-box
        so they can focus on the business logic and add value instantly.
      </p>
    </section>
  </Card>
</template>
