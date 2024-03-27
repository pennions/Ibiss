import './assets/css/prism.css'
import './assets/js/prism.js'

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// window.avianCssUrl = 'css2/avian.min.css'

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
