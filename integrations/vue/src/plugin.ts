import { createPinceauIntegration } from '@pinceau/integration'
import PinceauVuePlugin from './utils/unplugin'

export default createPinceauIntegration(
  [
    ['vue', PinceauVuePlugin],
  ],
  {
    vue: true,
  },
)
