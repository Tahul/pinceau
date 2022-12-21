import { createApp } from 'vue'
import { plugin as pinceau } from 'pinceau/runtime'
import { RouterView, createRouter, createWebHistory } from 'vue-router'

import App from './app.vue'
import Block from './components/Block.vue'
import BigButton from './components/BigButton.vue'
import Alert from './components/Alert.vue'
import ClientOnly from './theme/ClientOnly.vue'
import PlaygroundGrid from './components/PlaygroundGrid.vue'
import NuxtLayout from './layouts/default.vue'
import Index from './pages/index.vue'

import '@unocss/reset/tailwind.css'
import utils from '#pinceau/utils'
import 'pinceau.css'
import './main.css'

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
app.use(pinceau, { colorSchemeMode: 'class', utils })

// Components
app.component('Block', Block)
app.component('BigButton', BigButton)
app.component('Alert', Alert)
app.component('ClientOnly', ClientOnly)
app.component('PlaygroundGrid', PlaygroundGrid)
app.component('NuxtLayout', NuxtLayout)
app.component('NuxtPage', RouterView)

app.mount('#app')
