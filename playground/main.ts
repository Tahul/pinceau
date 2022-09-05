import { createApp } from 'vue'
import App from './app.vue'
import Block from './components/Block.vue'
import './theme/reset.css'
import 'pinceau.css'

const app = createApp(App)

app.component('Block', Block)

app.mount('#app')
