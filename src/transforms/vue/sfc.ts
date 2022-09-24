import type { SFCParseResult } from '@vue/compiler-sfc'
import { parse } from '@vue/compiler-sfc'
import type MagicString from 'magic-string'
import { logger } from '../../utils'
import type { VueQuery } from '../../utils/vue'
import type { PinceauContext, TokensFunction } from '../../types'
import { transformDt } from '../dt'
import { transformCssFunction } from '../css'
import { transformStyle } from './style'
import { transformVariants, transformVariantsProps } from './variants'
import { findPropsKey } from './ast'

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
  if (parsedComponent.descriptor.scriptSetup) { resolveScriptSetup(id, parsedComponent, magicString, variants, computedStyles) }

  return { code, early: false, magicString }
}

/**
 * Transform direct <style> queries.
 *
 * These does not need to resolve variants or populate computed styles.
 */
export function resolveStyleQuery(id: string, code: string, magicString: MagicString, $tokens: TokensFunction) {
  code = transformCssFunction(code, id, undefined, undefined, $tokens)
  code = transformStyle(code, $tokens)
  return { code, early: true, magicString }
}

/**
 * Transform <template> blocks.
 */
export function resolveTemplate(id: string, parsedComponent: SFCParseResult, magicString: MagicString) {
  const templateContent = parsedComponent.descriptor.template
  let newTemplateContent = templateContent.content
  newTemplateContent = transformDt(newTemplateContent, '\'')
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

      newStyle = transformStyle(newStyle, $tokens)
      newStyle = transformCssFunction(newStyle, id, variants, computedStyles, $tokens)

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
export function resolveScriptSetup(id: string, parsedComponent: SFCParseResult, magicString: MagicString, variants: any, computedStyles: any) {
  const scriptSetup = parsedComponent.descriptor.scriptSetup
  let newScriptSetup = scriptSetup.content

  // Transform `$dt()` usage
  newScriptSetup = transformDt(newScriptSetup, '`')

  // Check for variant props
  if (Object.keys(variants).length) {
    newScriptSetup = transformVariantsProps(newScriptSetup, variants)
    newScriptSetup = transformVariants(newScriptSetup, variants)
  }

  // Check for computed styles
  if (Object.keys(computedStyles).length) { newScriptSetup = transformComputedStyles(newScriptSetup, computedStyles) }

  // Overwrite <script setup> block with new content
  magicString.overwrite(scriptSetup.loc.start.offset, scriptSetup.loc.end.offset, newScriptSetup)
}

/**
 * Adds computed styles code to <script setup>
 */
export function transformComputedStyles(newScriptSetup: string, computedStyles: any): string {
  const propsKey = findPropsKey(newScriptSetup)

  if (propsKey) {
    newScriptSetup = `\nimport { transformTokensToVariable } from 'pinceau'\n${newScriptSetup}`
    if (!newScriptSetup.includes('computed')) {
      newScriptSetup = `\nimport { computed } from 'vue'\n${newScriptSetup}`
    }
    newScriptSetup += `\nconst _$cstProps = ${propsKey}`
    newScriptSetup += `\nconst _$cst = {
${
Object
.entries(computedStyles)
.map(
  ([key, styleFunction]) => {
    return `'${key}': computed(() => transformTokensToVariable(((props) => ${styleFunction})(_$cstProps)))\n`
  },
)
.join(',')
}
}
`
  }
  else {
    logger.warn('You seem to be using Computed Styles, but no props are defined in your component!')
  }

  return newScriptSetup
}
