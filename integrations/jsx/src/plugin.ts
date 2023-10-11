import { createPinceauIntegration } from '@pinceau/integration'
import PinceauJSXPlugin from './utils/unplugin'

const pinceauPlugin: any = createPinceauIntegration(
  [
    ['jsx', PinceauJSXPlugin],
  ],
  {
    jsx: true,
  },
)

export default pinceauPlugin
