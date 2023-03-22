import type { PinceauTransformContext } from 'pinceau/types/transforms'
import type { PinceauContext } from '../../types'
import { transformDtHelper } from '../dt'
import { transformCssFunction } from '../css-function'
import { message } from '../../utils/logger'
import { transformCSS } from '../css'
import { transformAddPinceauClass } from './add-class'
import { } from 'vue/compiler-sfc'
import { transformVariants } from './variants'

export function transformVueSFC(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) {
  const sfc = transformContext.sfc

  // Transform <style> blocks
  if (sfc?.descriptor?.styles) { transformStyles(transformContext, pinceauContext) }

  // Transform <template> blocks
  if (sfc?.descriptor?.template) { transformTemplate(transformContext, pinceauContext) }

  // Transform <script setup> blocks
  if (sfc?.descriptor?.scriptSetup) { transformScriptSetup(transformContext, pinceauContext) }
}

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

/**
 * Transform <template> blocks.
 */
export function transformTemplate(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) {
  // Check if runtime styles are enabled on this component
  const hasRuntimeStyles = Object.keys(transformContext.variants).length || Object.keys(transformContext.computedStyles).length

  // Transform `$dt()` from template
  transformDtHelper(transformContext, pinceauContext, { wrapper: '\'' })

  // Add class if runtime styles are enabled
  if (pinceauContext.options.runtime && hasRuntimeStyles) { transformAddPinceauClass(transformContext) }
}

/**
 * Transform all <style> blocks.
 */
export function transformStyles(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) {
  const styles = transformContext.sfc.descriptor.styles

  styles.forEach(
    (styleBlock) => {
      if (styleBlock.attrs.lang === 'ts' || styleBlock.lang === 'ts' || styleBlock.attrs?.transformed) { transformCssFunction(transformContext, pinceauContext, styleBlock) }
      transformCSS(transformContext, pinceauContext, styleBlock)
    },
  )
}

/**
 * Transforms <script setup> blocks.
 */
export function transformScriptSetup(
  transformContext: PinceauTransformContext,
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
    if (hasVariants || hasComputedStyles) { transformFinishRuntimeSetup(transformContext, { hasVariants, hasComputedStyles }) }
  }
  else if (hasVariants || hasComputedStyles) {
    // Warn on disabled runtime features used in components
    message('RUNTIME_FEATURES_CONFLICT', [transformContext.query.id])
  }
}

export function transformAddRuntimeImports(transformContext: PinceauTransformContext) {
  // Handle necessary Vue imports
  let vueImports: string[] | string = []
  const content = transformContext.sfc?.descriptor?.scriptSetup?.content

  if (!content) { return }

  if (!content.match(/reactive\(/gm)) { vueImports.push('reactive') }
  if (!content.match(/computed\(/gm)) { vueImports.push('computed') }
  if (!content.match(/getCurrentInstance\(/gm)) { vueImports.push('getCurrentInstance') }
  if (!content.match(/ref\(/gm)) { vueImports.push('ref') }
  if (vueImports.length) { vueImports = `import { ${vueImports.join(', ')} } from 'vue'` }
  else { vueImports = '' }

  transformContext.magicString.appendRight(
    transformContext.sfc.descriptor.scriptSetup.loc.start.offset,
    `\nimport { usePinceauRuntime } from \'pinceau/runtime\'\n${vueImports}`,
  )
}

/**
 * Adds computed styles code to <script setup>
 */
export function transformComputedStyles(transformContext: PinceauTransformContext) {
  Object
    .entries(transformContext.computedStyles)
    .forEach(([key, styleFunction]) => {
      const end = transformContext.sfc.descriptor.scriptSetup.loc.start.offset + transformContext.sfc.descriptor.scriptSetup.content.length
      transformContext.magicString.prependLeft(end, `\nconst ${key} = computed(() => ((props = getCurrentInstance().props) => ${styleFunction})())\n`)
    })
}

export function transformFinishRuntimeSetup(transformContext: PinceauTransformContext, { hasVariants, hasComputedStyles }: Record<string, boolean>) {
  transformContext.magicString.prependLeft(
    transformContext.sfc.descriptor.scriptSetup.loc.end.offset,
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
