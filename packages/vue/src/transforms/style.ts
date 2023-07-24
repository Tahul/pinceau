import type { PinceauContext, PinceauTransformContext } from '@pinceau/shared'
import { transforms } from '@pinceau/style'

const { transformCssFunction, transformCSS } = transforms

/**
 * Transform direct <style> queries.
 *
 * These does not need to resolve variants or populate computed styles.
 */
export function transformStyleQuery(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) {
  // Handle `lang="ts"` even though that should not happen here.
  if (transformContext.query.lang === 'ts') { transformCssFunction(transformContext, pinceauContext) }

  // Transform <style> block
  transformCSS(transformContext, pinceauContext)
}
