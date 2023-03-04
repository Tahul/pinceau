import type { PinceauTransformContext } from 'pinceau/types/transforms'
import type { PinceauContext } from '../../types'
import { variantsRegex } from '../../utils'
import { transformDtHelper } from '../dt'
import { transformCssFunction } from '../css'
import { message } from '../../utils/logger'
import { transformCSS } from './style'
import { transformVariants } from './variants'
import { transformAddPinceauClass } from './add-class'
import { } from 'vue/compiler-sfc'

export function transformVueSFC(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) {
  // Transform <style> blocks
  if (transformContext.sfc()?.descriptor?.styles) { transformStyles(transformContext, pinceauContext) }

  // Transform <template> blocks
  if (transformContext.sfc()?.descriptor?.template) { transformTemplate(transformContext, pinceauContext) }

  // Transform <script setup> blocks
  if (transformContext.sfc()?.descriptor?.scriptSetup) { transformScriptSetup(transformContext, pinceauContext) }
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
  const styles = transformContext.sfc().descriptor.styles

  styles.forEach(
    (styleBlock) => {
      if (
        styleBlock.attrs.lang === 'ts'
        || styleBlock.lang === 'ts'
        || styleBlock.attrs?.transformed
      ) {
        transformCssFunction(transformContext, pinceauContext, styleBlock)
      }

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
  transformDtHelper(transformContext, pinceauContext, { wrapper: '`' })

  // Cleanup `...variants` in any case
  transformContext.magicString.replace(variantsRegex, '')

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

/**
 * Adds computed styles code to <script setup>
 */
export function transformComputedStyles(transformContext: PinceauTransformContext) {
  const scriptSetup = transformContext.sfc().descriptor.scriptSetup

  Object
    .entries(transformContext.computedStyles)
    .forEach(([key, styleFunction]) => scriptSetup.append(`\nconst ${key} = computed(() => ((props = getCurrentInstance().props) => ${styleFunction})())\n`))
}

export function transformAddRuntimeImports(transformContext: PinceauTransformContext) {
  const scriptSetup = transformContext.sfc().descriptor.scriptSetup

  scriptSetup.prepend('import { usePinceauRuntime } from \'pinceau/runtime\'\n')

  // Handle necessary Vue imports
  const vueImports = []
  if (!scriptSetup.content.match(/reactive\(/gm)) { vueImports.push('reactive') }
  if (!scriptSetup.content.match(/computed\(/gm)) { vueImports.push('computed') }
  if (!scriptSetup.content.match(/getCurrentInstance\(/gm)) { vueImports.push('getCurrentInstance') }
  if (!scriptSetup.content.match(/ref\(/gm)) { vueImports.push('ref') }
  if (vueImports.length) { scriptSetup.prepend(`import { ${vueImports.join(', ')} } from 'vue'`) }
}

export function transformFinishRuntimeSetup(transformContext: PinceauTransformContext, { hasVariants, hasComputedStyles }: Record<string, boolean>) {
  const usePinceauRuntime = [
    `\n${(hasVariants || hasComputedStyles) ? 'const { $pinceau } = ' : ''}`,
    'usePinceauRuntime(',
    'getCurrentInstance().props, ',
    `${hasVariants ? '__$pVariants' : 'undefined'}, `,
    `${hasComputedStyles ? `{ ${Object.keys(transformContext.computedStyles).map(key => `${key}`).join(',')} }` : 'undefined'}`,
    ')\n',
  ].join('')
  transformContext.sfc().descriptor.scriptSetup.append(usePinceauRuntime)
}
