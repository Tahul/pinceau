import type { PinceauTransformFunction } from '@pinceau/core'

/**
 * Adds runtime imports at top of component <script setup>.
 */
export const transformAddRuntimeImports: PinceauTransformFunction = (
  transformContext,
) => {
  const { target } = transformContext

  target.prepend('\nimport { useVariants, useComputedStyle } from \'$pinceau/runtime\'')
}

/**
 * Add runtime setup on a component <script setup>.
 */
export const transformAddRuntimeSetup: PinceauTransformFunction = (
  transformContext,
) => {
  const { target } = transformContext

  // const code = '\nconsole.log(runtime)'

  // target.append(code)
}
