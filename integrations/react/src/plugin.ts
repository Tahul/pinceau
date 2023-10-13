import { createPinceauIntegration } from '@pinceau/integration'
import { PinceauReactPlugin } from './utils/unplugin'

const pinceauPlugin = createPinceauIntegration(
  [
    ['react', PinceauReactPlugin],
  ],
  {
    jsx: true,
  },
)

export default pinceauPlugin
