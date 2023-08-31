import type { PinceauTransformFunction } from '@pinceau/core'
import { nanoid } from 'nanoid'

/**
 * Adds runtime imports at top of component <script setup>.
 */
export const transformStartRuntimeSetup: PinceauTransformFunction = (
  transformContext,
) => {
  const { target } = transformContext

  target.prepend('\nimport { useVariants, useComputedStyle, usePinceauRuntime } from \'$pinceau\'')

  target.append(`\nconst { $pinceau } = usePinceauRuntime(\`${nanoid(8)}\`)`)
}

/**
 * Add runtime setup on a component <script setup>.
 */
export const transformEndRuntimeSetup: PinceauTransformFunction = (
  transformContext,
) => {
  const { target } = transformContext

  target.append('\n')
}
