import { createPinceauIntegration } from '@pinceau/integration'
import type { Plugin } from 'vite'
import type { PinceauUserOptions } from '@pinceau/core'

const pinceauPlugin: (userOptions?: PinceauUserOptions) => (Plugin[] | Plugin)[] = createPinceauIntegration()

export default pinceauPlugin
