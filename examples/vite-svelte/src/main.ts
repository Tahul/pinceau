import App from './App.svelte'
import { pinceauPlugin } from '$pinceau/svelte-plugin'

pinceauPlugin()

const app = new App({
  target: document.getElementById('app')!,
})

export default app
