import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import { plugin as pinceau } from 'pinceau/runtime'

import '@unocss/reset/tailwind.css'
import 'pinceau.css'

import Index from '../shared/pages/index.vue'
import App from './app.vue'

const app = createApp(App)

// Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Index,
    },
  ],
})

// Plugins
app.use(router)
app.use(pinceau)

app.mount('#app')
