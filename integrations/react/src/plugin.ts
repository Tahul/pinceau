import { createPinceauIntegration } from '@pinceau/integration'
import type { PinceauIntegration } from '@pinceau/integration'
import { PinceauReactPlugin } from './unplugin'

const pinceauPlugin: PinceauIntegration = createPinceauIntegration(
  [
    ['react', PinceauReactPlugin],
  ],
  {
    jsx: true,
  },
)

export default pinceauPlugin
