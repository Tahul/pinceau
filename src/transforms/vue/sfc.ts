import type { SFCParseResult } from '@vue/compiler-sfc'
import { parse } from '@vue/compiler-sfc'
import type MagicString from 'magic-string'
import { logger } from '../../utils'
import type { VueQuery } from '../../utils/vue'
import type { PinceauContext, TokensFunction } from '../../types'
import { transformDtHelper } from '../dt'
import { transformCssFunction } from '../css'
import { transformStyle } from './style'
import { transformVariants } from './variants'
import { findPropsKey } from './props'

export function transformVueSFC(code: string, id: string, magicString: MagicString, ctx: PinceauContext, query: VueQuery): { code: string; early: boolean; magicString: MagicString } {
  // Handle <style> tags scoped queries
  if (query.type === 'style') { return resolveStyleQuery(id, code, magicString, ctx.$tokens) }

  // Resolve from parsing the <style lang="ts"> tag for current component
  const variants = {}
  const computedStyles = {}

  // Parse component with compiler-sfc
  const parsedComponent = parse(code, { filename: id })

  // Transform <template> blocks
  if (parsedComponent.descriptor.template) { resolveTemplate(id, parsedComponent, magicString) }

  // Transform <style> blocks
  if (parsedComponent.descriptor.styles) { resolveStyle(id, parsedComponent, magicString, variants, computedStyles, ctx.$tokens) }

  // Transform <script setup> blocks
  if (parsedComponent.descriptor.scriptSetup) { resolveScriptSetup(id, parsedComponent, magicString, variants, computedStyles, parsedComponent.descriptor.scriptSetup.lang === 'ts') }

  return { code, early: false, magicString }
}

/**
 * Transform direct <style> queries.
 *
 * These does not need to resolve variants or populate computed styles.
 */
export function resolveStyleQuery(id: string, code: string, magicString: MagicString, $tokens: TokensFunction) {
  code = transformCssFunction(id, code, undefined, undefined, $tokens)
  code = transformStyle(code, $tokens)
  return { code, early: true, magicString }
}

/**
 * Transform <template> blocks.
 */
export function resolveTemplate(id: string, parsedComponent: SFCParseResult, magicString: MagicString) {
  const templateContent = parsedComponent.descriptor.template
  let newTemplateContent = templateContent.content
  newTemplateContent = transformDtHelper(newTemplateContent, '\'')
  magicString.overwrite(templateContent.loc.start.offset, templateContent.loc.end.offset, newTemplateContent)
}

/**
 * Transform all <style> blocks.
 */
export function resolveStyle(id: string, parsedComponent: SFCParseResult, magicString: MagicString, variants: any, computedStyles: any, $tokens: TokensFunction) {
  const styles = parsedComponent.descriptor.styles
  styles.forEach(
    (styleBlock) => {
      const { loc, content } = styleBlock
      let newStyle = content

      newStyle = transformCssFunction(id, newStyle, variants, computedStyles, $tokens)
      newStyle = transformStyle(newStyle, $tokens)

      magicString.remove(loc.start.offset, loc.end.offset)
      magicString.appendRight(
        loc.end.offset,
          `\n${newStyle}\n`,
      )
    },
  )
}

/**
 * Transforms <script setup> blocks.
 */
export function resolveScriptSetup(id: string, parsedComponent: SFCParseResult, magicString: MagicString, variants: any, computedStyles: any, isTs: boolean) {
  const scriptSetup = parsedComponent.descriptor.scriptSetup
  const hasVariants = Object.keys(variants).length
  const hasComputedStyles = Object.keys(computedStyles).length
  let newScriptSetup = scriptSetup.content

  // Transform `$dt()` usage
  newScriptSetup = transformDtHelper(newScriptSetup, '`')

  // Inject runtime imports
  if (hasVariants || hasComputedStyles) {
    newScriptSetup = transformAddRuntimeImports(newScriptSetup)
  }

  // Check for variant props
  if (hasVariants) {
    newScriptSetup = transformVariants(newScriptSetup, variants, isTs)
  }

  // Check for computed styles
  if (hasComputedStyles) {
    newScriptSetup = transformComputedStyles(newScriptSetup, computedStyles)
  }

  if (hasVariants || hasComputedStyles) {
    newScriptSetup = transformFinishRuntimeSetup(newScriptSetup, hasComputedStyles, hasVariants)
  }

  // Overwrite <script setup> block with new content
  magicString.overwrite(scriptSetup.loc.start.offset, scriptSetup.loc.end.offset, newScriptSetup)
}

/**
 * Adds computed styles code to <script setup>
 */
export function transformComputedStyles(newScriptSetup: string, computedStyles: any): string {
  newScriptSetup += `\nconst __$pComputed = reactive({
${
Object
.entries(computedStyles)
.map(
  ([key, styleFunction]) => {
    return `'${key}': computed(() => __$pUtils.transformTokensToVariable(((props, utils) => ${styleFunction})(__$pProps, __$pUtils)))\n\n`
  },
)
.join(',')
}
})
`

  return newScriptSetup
}

export function transformAddRuntimeImports(code: string): string {
  code = `\nimport { usePinceauRuntime, utils as __$pUtils } from 'pinceau/runtime'\n${code}`

  // TODO: Improve these imports
  if (!code.includes('reactive')) {
    code = `\nimport { reactive } from 'vue'\n${code}`
  }
  if (!code.includes('computed')) {
    code = `\nimport { computed } from 'vue'\n${code}`
  }

  const propsKey = findPropsKey(code)
  if (propsKey) {
    code += `\nconst __$pProps = ${propsKey}`
  }
  else {
    logger.warn('You seem to be using Computed Styles, but no props are defined in your component!')
  }

  return code
}

export function transformFinishRuntimeSetup(
  newScriptSetup,
  hasComputedStyles,
  hasVariants,
) {
  newScriptSetup += `\n${hasVariants ? 'const { $variantsClass } = ' : ''}usePinceauRuntime(__$pProps, ${hasVariants ? '__$pVariants' : 'undefined'}, ${hasComputedStyles ? 'undefined' : 'undefined'})\n`
  return newScriptSetup
}
