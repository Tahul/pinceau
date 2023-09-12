import { createApp } from 'vue'
import * as VueRouter from 'vue-router'
import App from './app.vue'
import Navigation from './components/Navigation.vue'
import { PinceauVue } from '$pinceau/vue-plugin'
import utils from '$pinceau/utils'
import theme from '$pinceau/theme'
import './style.css'

export const routes = [
  { path: '/', component: () => import('./features/index.vue') },
  { path: '/core', component: () => import('./features/core.vue') },
  { path: '/runtime', component: () => import('./features/runtime.vue') },
  { path: '/theme', component: () => import('./features/theme.vue') },
  { path: '/vue', component: () => import('./features/vue.vue') },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = VueRouter.createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: VueRouter.createWebHistory(),
  routes, // short for `routes: routes`
})

const app = createApp(App)

app.use(PinceauVue)

app.component('Navigation', Navigation)

app.use(router)

app.mount('#app')
