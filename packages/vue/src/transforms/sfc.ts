import type { PinceauContext, PinceauSFCTransformContext } from '@pinceau/shared'
import { message } from '@pinceau/shared'
import { transforms as styleTransforms } from '@pinceau/style'
import { transformAddPinceauClass } from './add-class'
import { transformVariants } from './variants'

const { transformCssFunction, transformStyle, transformTokenHelper } = styleTransforms

export function transformVueSFC(
  transformContext: PinceauSFCTransformContext,
  pinceauContext: PinceauContext,
) {
  const sfc = transformContext.sfc

  // Transform <style> blocks
  if (sfc?.styles) { transformStyles(transformContext, pinceauContext) }

  // Transform <template> blocks
  if (sfc?.template) { transformTemplate(transformContext, pinceauContext) }

  // Transform <script setup> blocks
  if (sfc?.scriptSetup) { transformScriptSetup(transformContext, pinceauContext) }
}

/**
 * Transform <template> blocks.
 */
export function transformTemplate(
  transformContext: PinceauSFCTransformContext,
  pinceauContext: PinceauContext,
) {
  // Check if runtime styles are enabled on this component
  const hasRuntimeStyles = Object.keys(transformContext.variants).length || Object.keys(transformContext.computedStyles).length

  // Transform `$dt()` from template
  transformTokenHelper(transformContext.sfc.template, pinceauContext, '\'')

  // Add class if runtime styles are enabled
  if (pinceauContext.options.runtime && hasRuntimeStyles) { transformAddPinceauClass(transformContext) }
}

/**
 * Transform all <style> blocks.
 */
export function transformStyles(
  transformContext: PinceauSFCTransformContext,
  pinceauContext: PinceauContext,
) {
  if (!transformContext?.sfc || !transformContext?.sfc?.scriptSetup) { return }

  const styles = transformContext.sfc.styles

  for (const styleBlock of styles) {
    if (
      styleBlock?.attrs?.lang === 'ts'
      || styleBlock?.lang === 'ts'
      || styleBlock?.attrs?.transformed
    ) {
      transformCssFunction(transformContext, pinceauContext)
    }

    transformStyle(styleBlock, pinceauContext)
  }
}

/**
 * Transforms <script setup> blocks.
 */
export function transformScriptSetup(
  transformContext: PinceauSFCTransformContext,
  pinceauContext: PinceauContext,
) {
  const hasVariants = !!Object.keys(transformContext.variants).length
  const hasComputedStyles = !!Object.keys(transformContext.computedStyles).length

  // Transform `$dt()` usage
  // transformDtHelper(transformContext, pinceauContext, { wrapper: '`' })

  if (pinceauContext.options.runtime) {
    // Inject runtime imports
    if (hasVariants || hasComputedStyles) { transformAddRuntimeImports(transformContext) }

    // Check for variant props
    if (hasVariants) { transformVariants(transformContext) }

    // Check for computed styles
    if (hasComputedStyles) { transformComputedStyles(transformContext) }

    // Push last runtime context
    if (hasVariants || hasComputedStyles) { transformFinishRuntimeSetup(transformContext) }
  }
  else if (hasVariants || hasComputedStyles) {
    // Warn on disabled runtime features used in components
    message('RUNTIME_FEATURES_CONFLICT', [transformContext.query.id])
  }
}

export function transformAddRuntimeImports(
  transformContext: PinceauSFCTransformContext,
) {
  if (!transformContext?.sfc || !transformContext?.sfc?.scriptSetup) { return }

  // Handle necessary Vue imports
  let vueImports: string[] | string = []
  const content = transformContext.sfc?.scriptSetup?.content

  if (!content) { return }

  if (!content.match(/reactive\(/gm)) { vueImports.push('reactive') }
  if (!content.match(/computed\(/gm)) { vueImports.push('computed') }
  if (!content.match(/getCurrentInstance\(/gm)) { vueImports.push('getCurrentInstance') }
  if (!content.match(/ref\(/gm)) { vueImports.push('ref') }
  if (vueImports.length) { vueImports = `import { ${vueImports.join(', ')} } from 'vue'` }
  else { vueImports = '' }

  transformContext.magicString.appendRight(
    transformContext.sfc.scriptSetup.loc.start.offset,
    `\nimport { usePinceauRuntime } from \'pinceau/runtime\'\n${vueImports}`,
  )
}

/**
 * Adds computed styles code to <script setup>
 */
export function transformComputedStyles(transformContext: PinceauSFCTransformContext) {
  if (!transformContext?.sfc || !transformContext?.sfc?.scriptSetup) { return }

  Object
    .entries(transformContext.computedStyles)
    .forEach(([key, styleFunction]) => {
      if (!transformContext?.sfc?.scriptSetup) { return }
      const end = transformContext.sfc.scriptSetup.loc.start.offset + transformContext.sfc.scriptSetup.content.length
      transformContext.magicString.prependLeft(end, `\nconst ${key} = computed(() => ((props = getCurrentInstance().props) => ${styleFunction})())\n`)
    })
}

export function transformFinishRuntimeSetup(
  transformContext: PinceauSFCTransformContext,
) {
  if (!transformContext?.sfc || !transformContext?.sfc?.scriptSetup) { return }

  const hasVariants = !!Object.keys(transformContext.variants).length
  const hasComputedStyles = !!Object.keys(transformContext.computedStyles).length

  transformContext.magicString.prependLeft(
    transformContext.sfc.scriptSetup.loc.end.offset,
    [
      `\n${(hasVariants || hasComputedStyles) ? 'const { $pinceau } = ' : ''}`,
      'usePinceauRuntime(',
      'getCurrentInstance().props, ',
      `${hasVariants ? '__$pVariants' : 'undefined'}, `,
      `${hasComputedStyles ? `{ ${Object.keys(transformContext.computedStyles).map(key => `${key}`).join(',')} }` : 'undefined'}`,
      ')\n',
    ].join(''),
  )
}
