import type { SFCParseResult } from '@vue/compiler-sfc'
import type MagicString from 'magic-string'
import { parseVueComponent } from '../../utils/ast'
import type { PinceauContext, VueQuery } from '../../types'
import { variantsRegex } from '../../utils'
import { transformDtHelper } from '../dt'
import { transformCssFunction } from '../css'
import { message } from '../../utils/logger'
import { transformStyle } from './style'
import { transformVariants } from './variants'
import { transformAddPropsKey } from './props-key'
import { transformAddPinceauClass } from './add-class'

export function transformVueSFC(
  code: string,
  query: VueQuery,
  magicString: MagicString,
  ctx: PinceauContext,
): { code: string; magicString: MagicString; variants: any; computedStyles: any; localTokens: any } {
  // Resolve from parsing the <style lang="ts"> tag for current component
  const variants = {}
  const computedStyles = {}
  const localTokens = {}

  // Parse component with compiler-sfc
  const parsedComponent = parseVueComponent(code, { filename: query.id })

  // Transform <style> blocks
  if (parsedComponent?.descriptor?.styles) {
    resolveStyle(query.id, parsedComponent, magicString, variants, computedStyles, localTokens, ctx, query)
  }

  // Check if runtime styles are enabled on this component
  const hasRuntimeStyles = Object.keys(variants).length > 0 || Object.keys(computedStyles).length > 0

  // Transform <template> blocks
  if (parsedComponent?.descriptor?.template) {
    resolveTemplate(query.id, parsedComponent, magicString, ctx, hasRuntimeStyles)
  }

  // Transform <script setup> blocks
  if (parsedComponent?.descriptor?.scriptSetup) {
    resolveScriptSetup(query.id, parsedComponent, magicString, variants, computedStyles, ctx, parsedComponent.descriptor.scriptSetup.lang === 'ts')
  }

  return { code, magicString, variants, computedStyles, localTokens }
}

/**
 * Transform direct <style> queries.
 *
 * These does not need to resolve variants or populate computed styles.
 */
export function resolveStyleQuery(code: string, magicString: MagicString, query: VueQuery, ctx: PinceauContext, loc?: any) {
  // Handle `lang="ts"` even though that should not happen here.
  if (query.lang === 'ts') { code = transformCssFunction(query.id, code, {}, {}, {}, ctx, loc) }

  // Transform <style> block
  code = transformStyle(code, ctx)

  return { code, magicString }
}

/**
 * Transform <template> blocks.
 */
export function resolveTemplate(_: string, parsedComponent: SFCParseResult, magicString: MagicString, ctx: PinceauContext, hasRuntimeStyles: boolean) {
  // Transform `$dt()` from template
  const templateContent = parsedComponent.descriptor.template
  let newTemplateContent = templateContent.content
  newTemplateContent = transformDtHelper(newTemplateContent, ctx, '\'')

  // Add class if runtime styles are enabled
  if (ctx.options.runtime && hasRuntimeStyles) { newTemplateContent = transformAddPinceauClass(newTemplateContent) }

  // Overwrite <template>
  if (templateContent.loc.end?.offset && templateContent.loc.end?.offset > templateContent.loc.start.offset) {
    magicString.overwrite(
      templateContent.loc.start.offset,
      templateContent.loc.end.offset,
      newTemplateContent,
    )
  }
}

/**
 * Transform all <style> blocks.
 */
export function resolveStyle(
  id: string,
  parsedComponent: SFCParseResult,
  magicString: MagicString,
  variants: any,
  computedStyles: any,
  localTokens: any,
  ctx: PinceauContext,
  query?: VueQuery,
) {
  const styles = parsedComponent.descriptor.styles
  styles.forEach(
    (styleBlock) => {
      const { loc, content } = styleBlock
      let code = content

      if (
        styleBlock.attrs.lang === 'ts'
        || styleBlock.lang === 'ts'
        || styleBlock.attrs?.transformed
      ) {
        code = transformCssFunction(id, code, variants, computedStyles, localTokens, ctx, { query, ...loc })
      }

      code = transformStyle(code, ctx)

      magicString.remove(loc.start.offset, loc.end.offset)
      magicString.appendRight(loc.end.offset, `\n${code}\n`)
    },
  )
}

/**
 * Transforms <script setup> blocks.
 */
export function resolveScriptSetup(
  id: string,
  parsedComponent: SFCParseResult,
  magicString: MagicString,
  variants: any,
  computedStyles: any,
  ctx: PinceauContext,
  isTs: boolean,
) {
  const scriptSetup = parsedComponent.descriptor.scriptSetup
  const hasVariants = Object.keys(variants).length
  const hasComputedStyles = Object.keys(computedStyles).length
  let code = scriptSetup.content

  // Transform `$dt()` usage
  code = transformDtHelper(code, ctx, '`')

  // Cleanup `...variants` in any case
  code = code.replace(variantsRegex, () => '')

  if (ctx.options.runtime) {
    // Inject runtime imports
    if (hasVariants || hasComputedStyles) { code = transformAddRuntimeImports(code) }

    // Check for variant props
    if (hasVariants) { code = transformVariants(code, variants, isTs) }

    // Check for computed styles
    if (hasComputedStyles) { code = transformComputedStyles(code, computedStyles) }

    // Push last runtime context
    if (hasVariants || hasComputedStyles) { code = transformFinishRuntimeSetup(code, hasComputedStyles, hasVariants, computedStyles) }
  }
  else {
    if (hasVariants || hasComputedStyles) {
      message('RUNTIME_FEATURES_CONFLICT', [id])
    }
  }

  // Overwrite <script setup> block with new content
  magicString.overwrite(scriptSetup.loc.start.offset, scriptSetup.loc.end.offset, code)
}

/**
 * Adds computed styles code to <script setup>
 */
export function transformComputedStyles(code: string, computedStyles: any): string {
  code = Object
    .entries(computedStyles)
    .map(
      ([key, styleFunction]) => {
        return `\nconst ${key} = computed(() => ((props = __$pProps, utils = __$pUtils) => ${styleFunction})())\n`
      },
    ).join('\n') + code

  return code
}

export function transformAddRuntimeImports(code: string): string {
  code = `\nimport { usePinceauRuntime, utils as __$pUtils } from 'pinceau/runtime'\n${code}`

  // TODO: Improve these imports
  if (!code.match(/reactive\(/gm)) {
    code = `\nimport { reactive } from 'vue'\n${code}`
  }
  if (!code.match(/computed\(/gm)) {
    code = `\nimport { computed } from 'vue'\n${code}`
  }
  if (!code.match(/getCurrentInstance\(/gm)) {
    code = `\nimport { getCurrentInstance } from 'vue'\n${code}`
  }
  if (!code.match(/ref\(/gm)) {
    code = `\nimport { ref } from 'vue'\n${code}`
  }

  // Resolve defineProps reference or add it
  const { propsKey, code: _code } = transformAddPropsKey(code)
  code = _code

  // Props w/o const
  if (propsKey && propsKey === '__$pProps') { return code }

  // Props w/ const or no props
  code += `\nconst __$pProps = ${propsKey || '{}'}\n`

  return code
}

export function transformFinishRuntimeSetup(
  newScriptSetup,
  hasComputedStyles,
  hasVariants,
  computedStyles,
) {
  newScriptSetup += [
    `\n${(hasVariants || hasComputedStyles) ? 'const { $pinceau } = ' : ''}`,
    'usePinceauRuntime(',
    'computed(() => __$pProps),',
    `${hasVariants ? '__$pVariants' : 'undefined'},`,
    `${hasComputedStyles ? `ref({ ${Object.keys(computedStyles).map(key => `${key}`).join(',')} })` : 'undefined'}`,
    ') \n',
  ].join('')

  return newScriptSetup
}
