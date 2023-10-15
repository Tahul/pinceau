import { createPinceauIntegration } from '@pinceau/integration'
import type { PinceauIntegration } from '@pinceau/integration'
import { PinceauSveltePlugin } from './utils/unplugin'

const pinceauPlugin: PinceauIntegration = createPinceauIntegration(
  [
    ['svelte', PinceauSveltePlugin],
  ],
  {
    svelte: true,
  },
)

export default pinceauPlugin
