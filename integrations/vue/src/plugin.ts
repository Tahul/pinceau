import { createPinceauIntegration } from '@pinceau/integration'
import { PinceauVuePlugin } from './utils/unplugin'

const pinceauPlugin: any = createPinceauIntegration(
  [
    ['vue', PinceauVuePlugin],
  ],
  {
    vue: true,
  },
)

export default pinceauPlugin
