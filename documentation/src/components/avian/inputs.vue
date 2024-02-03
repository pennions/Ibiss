<script setup>
import { onMounted } from 'vue'
import Card from '../shared/Card.vue'

const input_buttons =
  '<input type="button" value="submit" />\n<input type="reset" />\n<input type="submit" />'
const input_checkradio = '<input type="checkbox" />\n<input type="radio" />'
const input_textarea =
  '<textarea cols="30" rows="10"></textarea>\n<textarea cols="6" rows="3" disabled></textarea>\n<textarea cols="6" rows="3" invalid></textarea>'
const input_select =
  '<select name="fruits" id="fruit">\n      <option value="apple">Apple</option>\n      <option value="banana">Banana</option>\n      <option value="pineapple">Pineapple</option>\n      <option value="cherry">Cherry</option>\n</select>\n<select name="fruits" id="fruit" disabled>\n      <option value="apple">Apple</option>\n      <option value="banana">Banana</option>\n      <option value="pineapple">Pineapple</option>\n      <option value="cherry">Cherry</option>\n</select>'
const input_text =
  '<input type="email" />\n<input type="password" />\n<input type="search" />\n<input type="text" />\n<input type="url" />'
const input_numbers = '<input type="number" />\n<input type="range" />\n<input type="tel" />'
const input_datetime =
  '<input type="date" />\n<input type="datetime-local" />\n<input type="time" />\n<input type="month" />\n<input type="week" />'
const input_others =
  '<input type="color" />\n<input type="file" />\n<input type="image" />\n<input type="hidden" />'
const input_modifiers =
  '<input type="text" class="underline" placeholder="Input with underline class" />\n<input type="range" disabled />\n<input type="number" disabled />\n<input type="text" invalid />\n<input type="text" invalid="false" />\n<input type="button" value="submit" disabled>\n<input type="text" invalid="false" required />'

onMounted(() => {
  // eslint-disable-next-line no-undef
  Prism.highlightAll()
})
</script>

<template>
  <Card class="column gap-5">
    <article>
      <header>
        <h1 class="mb-2">Inputs</h1>
        <hr />
      </header>

      <section class="column no-stretch gap-3">
        <table>
          <tbody>
            <tr>
              <td class="pr-1">Checkbox</td>
              <td><input type="checkbox" /></td>
            </tr>
            <tr>
              <td class="pr-1">Radiobutton</td>
              <td><input type="radio" /></td>
            </tr>

            <tr>
              <td class="pr-1">type: button, value: submit</td>
              <td><input type="button" value="submit" /></td>
            </tr>
            <tr>
              <td class="pr-1">type: reset</td>
              <td><input type="reset" /></td>
            </tr>
            <tr>
              <td class="pr-1">type: submit</td>
              <td><input type="submit" /></td>
            </tr>

            <tr>
              <td class="pr-1">Email</td>
              <td><input type="email" /></td>
            </tr>
            <tr>
              <td class="pr-1">Password</td>
              <td><input type="password" /></td>
            </tr>
            <tr>
              <td class="pr-1">Search</td>
              <td><input type="search" /></td>
            </tr>
            <tr>
              <td class="pr-1">Text</td>
              <td><input type="text" /></td>
            </tr>
            <tr>
              <td class="pr-1">Url</td>
              <td><input type="url" /></td>
            </tr>
            <tr>
              <td class="pr-1">Number</td>
              <td><input type="number" /></td>
            </tr>
            <tr>
              <td class="pr-1">Range</td>
              <td><input type="range" class="w-100" /></td>
            </tr>
            <tr>
              <td class="pr-1">Tel (Phonenumber)</td>
              <td><input type="tel" /></td>
            </tr>
            <tr>
              <td class="pr-1">Date</td>
              <td><input type="date" /></td>
            </tr>
            <tr>
              <td class="pr-1">Datetime local</td>
              <td><input type="datetime-local" /></td>
            </tr>
            <tr>
              <td class="pr-1">Time</td>
              <td><input type="time" /></td>
            </tr>
            <tr>
              <td class="pr-1">Month</td>
              <td><input type="month" /></td>
            </tr>
            <tr>
              <td class="pr-1">Week</td>
              <td><input type="week" /></td>
            </tr>
            <tr>
              <td class="pr-1">Color</td>
              <td><input type="color" /></td>
            </tr>
            <tr>
              <td class="pr-1">File</td>
              <td><input type="file" /></td>
            </tr>
            <tr>
              <td class="pr-1">Image</td>
              <td><input type="image" /></td>
            </tr>
            <tr>
              <td class="pr-1">Hidden</td>
              <td><input type="hidden" /></td>
            </tr>

            <tr>
              <td class="pr-1">Select</td>
              <td>
                <select name="fruits" id="fruit">
                  <option value="apple">Apple</option>
                  <option value="banana">Banana</option>
                  <option value="pineapple">Pineapple</option>
                  <option value="cherry">Cherry</option>
                </select>
              </td>
            </tr>

            <tr>
              <td class="pr-1 text-top">Textarea</td>
              <td>
                <textarea cols="30" rows="10"></textarea>
              </td>
            </tr>
          </tbody>
        </table>

        <h3 id="input_modifiers" class="mt-1">Additional input styles</h3>
        <hr />

        <p>
          You can create a very minimalistic input by adding the
          <code class="language-html">underline</code> class.
        </p>

        <input type="text" class="underline" placeholder="Input with underline class" />

        <p>The invalid and disabled attributes work on all inputs, even textarea.</p>

        <p>
          To disable an input add the
          <code class="language-html">disabled</code> attribute:
        </p>

        <input type="text" disabled />
        <input type="range" disabled />
        <input type="number" disabled />
        <input type="button" value="submit" disabled />

        <p>
          To show that an input is invalid add the
          <code class="language-html">invalid</code> attribute:
        </p>
        <input type="text" invalid />
        <p>
          adding
          <code class="language-html">invalid="false"</code> attribute will make it normal again
          (visual only):
        </p>

        <input type="text" invalid="false" />

        <p>
          When you use the
          <code class="language-html">required</code> attribute on an input, you need to toggle the
          validness using the
          <code class="language-html">invalid="true" / invalid="false"</code> attribute<br />
        </p>

        <p>
          Input with only
          <code class="language-html">required</code> attribute:
        </p>
        <input type="text" required />

        <p>
          Input with
          <code class="language-html">required invalid="false"</code>
          attributes:
        </p>
        <input type="text" required />

        <p>
          Input with
          <code class="language-html">required invalid="true"</code>
          attributes:
        </p>
        <input type="text" invalid="true" required />

        <p>Type a letter in the number input to trigger the webbrowsers built-in invalidation:</p>
        <input type="number" />

        <p>A disabled select element:</p>

        <select name="fruits" id="fruit" disabled class="self-align-start">
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="pineapple">Pineapple</option>
          <option value="cherry">Cherry</option>
        </select>

        <p>A disabled textarea element:</p>

        <textarea cols="6" rows="3" disabled></textarea>

        <p>An invalid textarea element:</p>

        <textarea cols="6" rows="3" invalid></textarea>

        <b class="font-size-18 mt-5">Code examples:</b>
        <pre class="border stretch"><code class="language-html">{{ input_checkradio }}</code></pre>
        <pre class="border stretch"><code class="language-html">{{ input_buttons }}</code></pre>
        <pre class="border stretch"><code class="language-html">{{ input_text }}</code></pre>
        <pre class="border stretch"><code class="language-html">{{ input_numbers }}</code></pre>
        <pre class="border stretch"><code class="language-html">{{ input_datetime }}</code></pre>
        <pre class="border stretch"><code class="language-html">{{ input_others }}</code></pre>
        <pre class="border stretch"><code class="language-html">{{ input_modifiers }}</code></pre>
        <pre class="border stretch"><code class="language-html">{{ input_select }}</code></pre>
        <pre class="border stretch"><code class="language-html">{{ input_textarea }}</code></pre>
      </section>
    </article>
  </Card>
</template>
<style scoped>
input,
textarea {
  max-width: fit-content;
}

[type='color'] {
  width: 8rem;
  max-width: 8rem;
}

.text-top {
  text-align: top;
}
</style>
