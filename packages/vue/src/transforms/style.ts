import type { PinceauContext, PinceauSFCTransformContext, PinceauTransformContext } from '@pinceau/core'
import { transforms as styleTransforms, transforms } from '@pinceau/style'

const { transformCssFunction } = transforms

const { transformTokenHelper, transformColorScheme, transformMediaQueries } = styleTransforms

/**
 * Helper grouping all resolvers applying to <style>
 */
export function transformStyle(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) {
  transformTokenHelper(transformContext, pinceauContext)
  transformMediaQueries(transformContext, pinceauContext)
  transformColorScheme(transformContext, pinceauContext)
}

/**
 * Transform direct <style> queries.
 *
 * These does not need to resolve variants or populate computed styles.
 */
export function transformStyleQuery(
  transformContext: PinceauSFCTransformContext,
  pinceauContext: PinceauContext,
) {
  // Handle `lang="ts"` even though that should not happen here.
  if (transformContext.query.lang === 'ts') { transformCssFunction(transformContext, pinceauContext) }

  // Transform <style> block
  transformStyle(transformContext, pinceauContext)
}
