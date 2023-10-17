import type { PinceauIntegration } from '@pinceau/integration'
import { createPinceauIntegration } from '@pinceau/integration'
import { PinceauVuePlugin } from './unplugin'

const pinceauPlugin: PinceauIntegration = createPinceauIntegration(
  [
    ['vue', PinceauVuePlugin],
  ],
  {
    vue: true,
  },
)

export default pinceauPlugin
