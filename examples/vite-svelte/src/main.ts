import App from './App.svelte'
import { pinceauPlugin } from '@pinceau/outputs/svelte-plugin'

pinceauPlugin()

const app = new App({
  target: document.getElementById('app')!,
})

export default app
