import { createPinceauIntegration } from '@pinceau/integration'
import PinceauSveltePlugin from './utils/unplugin'

const pinceauPlugin: any = createPinceauIntegration(
  [
    ['svelte', PinceauSveltePlugin],
  ],
  {
    svelte: true,
  },
)

export default pinceauPlugin
