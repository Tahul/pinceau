import { resolve } from 'pathe'

export default defineNuxtConfig({
  components: [
    {
      path: resolve(__dirname, './components'),
      global: true,
    },
  ],
})
