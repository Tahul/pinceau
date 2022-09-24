import type { SFCParseResult } from '@vue/compiler-sfc'
import { parse } from '@vue/compiler-sfc'
import type MagicString from 'magic-string'
import { logger } from '../../utils'
import type { VueQuery } from '../../utils/vue'
import type { PinceauContext, TokensFunction } from '../../types'
import { transformDt } from '../dt'
import { transformCssFunction } from '../css'
import { transformStyle } from './style'
import { transformVariantsProps } from './variants-props'
import { findPropsKey } from './ast'

export function transformVueSFC(code: string, id: string, magicString: MagicString, ctx: PinceauContext, query: VueQuery): { code: string; early: boolean; magicString: MagicString } {
  // Handle <style> tags scoped queries
  if (query.type === 'style') { return resolveStyleQuery(id, code, magicString, ctx.$tokens) }

  // Resolve from parsing the <style lang="ts"> tag for current component
  const variantProps = {}
  const computedStyles = {}

  // Parse component with compiler-sfc
  const parsedComponent = parse(code, { filename: id })

  // Transform <template> blocks
  if (parsedComponent.descriptor.template) { resolveTemplate(id, parsedComponent, magicString) }

  // Transform <style> blocks
  if (parsedComponent.descriptor.styles) { resolveStyle(id, parsedComponent, magicString, variantProps, computedStyles, ctx.$tokens) }

  // Transform <script setup> blocks
  if (parsedComponent.descriptor.scriptSetup) { resolveScriptSetup(id, parsedComponent, magicString, variantProps, computedStyles) }

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
export function resolveStyle(id: string, parsedComponent: SFCParseResult, magicString: MagicString, variantProps: any, computedStyles: any, $tokens: TokensFunction) {
  const styles = parsedComponent.descriptor.styles
  styles.forEach(
    (styleBlock) => {
      const { loc, content } = styleBlock
      let newStyle = content

      newStyle = transformStyle(newStyle, $tokens)
      newStyle = transformCssFunction(newStyle, id, variantProps, computedStyles, $tokens)

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
export function resolveScriptSetup(id: string, parsedComponent: SFCParseResult, magicString: MagicString, variantProps: any, computedStyles: any) {
  const scriptSetup = parsedComponent.descriptor.scriptSetup
  let newScriptSetup = scriptSetup.content
  newScriptSetup = transformDt(newScriptSetup, '`')
  newScriptSetup = transformVariantsProps(newScriptSetup, variantProps)
  if (Object.keys(computedStyles).length) {
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
  }

  magicString.overwrite(scriptSetup.loc.start.offset, scriptSetup.loc.end.offset, newScriptSetup)
}
