import { createApp } from 'vue'
import * as VueRouter from 'vue-router'
import App from './app.vue'
import { PinceauVue } from '@pinceau/outputs/vue-plugin'
import './style.css'

export const routes = [
  { path: '/', component: () => import('./pages/index.vue') }
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

app.use(router)

app.mount('#app')
