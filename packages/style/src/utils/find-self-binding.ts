import type { PinceauTransformContext } from '@pinceau/core'

export function findSelfBindingFunction(transformContext: PinceauTransformContext) {
  if (transformContext?.state?.styleFunctions) {
    // Check if a <style> block contains a `styled` function, which is the only acceptable place for a self-binding function.
    return Object.keys(transformContext.state.styleFunctions).find(id => id.startsWith('style') && id.endsWith('styled0'))
  }
}
