import { transformDtHelper, transformStyleQuery, transformVueSFC } from './transforms'
import type { PinceauContext, PinceauTransformContext } from './types'
import { JS_EXTENSIONS, message } from './utils'

export function transformComponent(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) {
  const query = transformContext.query

  try {
    // Handle $dt in JS(X)/TS(X) files
    if (JS_EXTENSIONS.includes(query.ext)) {
      transformDtHelper(transformContext, pinceauContext)
      return transformContext.result()
    }

    // Handle CSS files & <style> tags scoped queries
    if ((query.styles && !query.vue) || query.type === 'style') {
      transformStyleQuery(transformContext, pinceauContext)
      return transformContext.result()
    }

    // Transform Vue
    transformVueSFC(transformContext, pinceauContext)
  }
  catch (e) {
    message('TRANSFORM_ERROR', [query.id, e])
    return { code: transformContext.code }
  }
}
