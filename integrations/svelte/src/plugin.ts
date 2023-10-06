import { createPinceauIntegration } from '@pinceau/integration'
import PinceauSveltePlugin from './utils/unplugin'

export default createPinceauIntegration(
  [
    ['svelte', PinceauSveltePlugin],
  ],
  {
    svelte: true,
  },
)
