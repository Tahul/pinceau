import { createApp } from 'vue'
import App from './App.vue'

(window as any).process = { env: {} }

createApp(App).mount('#app')
