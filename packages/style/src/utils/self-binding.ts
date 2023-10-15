import type { PinceauTransformContext } from '@pinceau/core'
import type { PinceauStyleFunctionContext } from '..'

export function findSelfBindingFunction(transformContext: PinceauTransformContext): PinceauStyleFunctionContext | undefined {
  if (transformContext?.state?.styleFunctions) {
    // Check if a <style> block contains a `styled` function, which is the only acceptable place for a self-binding function.
    return Object.values(transformContext?.state?.styleFunctions || {}).find(styleFn => styleFn?.id && isSelfBindingFunction(styleFn))
  }
}

export function isSelfBindingFunction({ id }: { id: string }) {
  return id.startsWith('style') && id.endsWith('styled0')
}
