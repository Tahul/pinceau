import { createApp } from 'vue'
import { plugin as pinceau } from 'pinceau/runtime'
import { RouterView, createRouter, createWebHistory } from 'vue-router'

import App from './app.vue'
import Block from './components/Block.vue'
import NuxtLayout from './layouts/default.vue'
import Index from './pages/index.vue'

import '@unocss/reset/tailwind.css'
import 'pinceau.css'

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

// Components
app.component('Block', Block)
app.component('NuxtLayout', NuxtLayout)
app.component('NuxtPage', RouterView)

app.mount('#app')
