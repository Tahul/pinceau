import type { SFCParseResult } from 'vue/compiler-sfc'
import type MagicString from 'magic-string'
import type { ASTNode } from 'ast-types'
import { astTypes, expressionToAst, parseVueComponent, printAst } from '../../utils/ast'
import type { VueQuery } from '../../utils/query'
import type { ColorSchemeModes, PinceauContext, TokensFunction } from '../../types'
import { transformDtHelper } from '../dt'
import { transformCssFunction } from '../css'
import { transformStyle } from './style'
import { transformVariants } from './variants'
import { resolvePropsKey } from './props'

export async function transformVueSFC(code: string, id: string, magicString: MagicString, ctx: PinceauContext, query: VueQuery): Promise<{ code: string; early: boolean; magicString: MagicString }> {
  // Handle <style> tags scoped queries
  if (query.type === 'style') { return resolveStyleQuery(code, magicString, ctx.$tokens, ctx.customProperties, ctx.options.colorSchemeMode) }

  // Resolve from parsing the <style lang="ts"> tag for current component
  const variants = {}
  const computedStyles = {}

  // Parse component with compiler-sfc
  const parsedComponent = parseVueComponent(code, { filename: id })

  // Transform <style> blocks
  if (parsedComponent.descriptor.styles) { resolveStyle(id, parsedComponent, magicString, variants, computedStyles, ctx.$tokens, ctx.customProperties, ctx.options.colorSchemeMode) }

  const hasRuntimeStyles = Object.keys(variants).length > 0 || Object.keys(computedStyles).length > 0

  // Transform <template> blocks
  if (parsedComponent.descriptor.template) { await resolveTemplate(id, parsedComponent, magicString, hasRuntimeStyles) }

  // Transform <script setup> blocks
  if (parsedComponent.descriptor.scriptSetup) { resolveScriptSetup(id, parsedComponent, magicString, variants, computedStyles, ctx.$tokens, ctx.options.colorSchemeMode, parsedComponent.descriptor.scriptSetup.lang === 'ts') }

  return { code, early: false, magicString }
}

/**
 * Transform direct <style> queries.
 *
 * These does not need to resolve variants or populate computed styles.
 */
export function resolveStyleQuery(code: string, magicString: MagicString, $tokens: TokensFunction, customProperties: any, colorSchemeMode: ColorSchemeModes) {
  code = transformCssFunction(code, undefined, undefined, $tokens, customProperties, colorSchemeMode)
  code = transformStyle(code, $tokens, colorSchemeMode)
  return { code, early: true, magicString }
}

/**
 * Transform <template> blocks.
 */
export async function resolveTemplate(_: string, parsedComponent: SFCParseResult, magicString: MagicString, hasRuntimeStyles: boolean) {
  const templateContent = parsedComponent.descriptor.template
  let newTemplateContent = templateContent.content
  newTemplateContent = transformDtHelper(newTemplateContent, '\'')
  if (hasRuntimeStyles) {
    newTemplateContent = await transformAddPinceauClass(newTemplateContent)
  }
  if (templateContent.loc.end?.offset && templateContent.loc.end?.offset > templateContent.loc.start.offset) {
    magicString.overwrite(templateContent.loc.start.offset, templateContent.loc.end.offset, newTemplateContent)
  }
}

/**
 * Transform all <style> blocks.
 */
export function resolveStyle(_: string, parsedComponent: SFCParseResult, magicString: MagicString, variants: any, computedStyles: any, $tokens: TokensFunction, customProperties: any, colorSchemeMode: ColorSchemeModes) {
  const styles = parsedComponent.descriptor.styles
  styles.forEach(
    (styleBlock) => {
      const { loc, content } = styleBlock
      let newStyle = content

      newStyle = transformCssFunction(newStyle, variants, computedStyles, $tokens, customProperties, colorSchemeMode)
      newStyle = transformStyle(newStyle, $tokens, colorSchemeMode)

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
export function resolveScriptSetup(id: string, parsedComponent: SFCParseResult, magicString: MagicString, variants: any, computedStyles: any, $tokens: TokensFunction, colorSchemeMode: ColorSchemeModes, isTs: boolean) {
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
    newScriptSetup = transformFinishRuntimeSetup(newScriptSetup, hasComputedStyles, hasVariants, computedStyles)
  }

  // Overwrite <script setup> block with new content
  magicString.overwrite(scriptSetup.loc.start.offset, scriptSetup.loc.end.offset, newScriptSetup)
}

/**
 * Adds computed styles code to <script setup>
 */
export function transformComputedStyles(newScriptSetup: string, computedStyles: any): string {
  newScriptSetup = Object
    .entries(computedStyles)
    .map(
      ([key, styleFunction]) => {
        return `\nconst ${key} = computed(() => ((props = __$pProps, utils = __$pUtils) => ${styleFunction})())\n`
      },
    ).join('\n') + newScriptSetup

  return newScriptSetup
}

/**
 * Adds `$pinceau` to the root element class via transform
 */
export async function transformAddPinceauClass(code: string): Promise<string> {
  // $pinceau class already here
  if (code.includes('$pinceau')) { return code }

  let firstTag: any = code.match(/<([a-zA-Z]+)([^>]+)*>/)

  if (firstTag?.[0]) {
    const _source = String(firstTag[0])
    if (_source.includes(':class')) {
      // Check for existing class, inject into it via AST if needed
      const existingAttr: ASTNode = _source.match(/:class="([^"]+)"/) as any
      if (existingAttr) {
        let attrAst = expressionToAst(existingAttr[1])
        const newAttrAst = astTypes.builders.identifier('$pinceau')
        switch (attrAst.type) {
          case 'ArrayExpression':
            attrAst.elements.push(newAttrAst)
            break
          case 'StringLiteral':
          case 'Literal':
            attrAst = astTypes.builders.arrayExpression([
              existingAttr as any,
            ])
            break
          case 'ObjectExpression':
            attrAst = astTypes.builders.arrayExpression([
              existingAttr as any,
              newAttrAst,
            ])
            break
        }

        firstTag = _source.replace(existingAttr[1], printAst(attrAst).code)
      }
    }
    else if (_source.includes('/>')) {
      // Self closing tag
      firstTag = _source.replace('/>', ' :class="[$pinceau]" />')
    }
    else {
      // Regular tag
      firstTag = _source.replace('>', ' :class="[$pinceau]">')
    }

    code = code.replace(_source, firstTag)
  }

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
  const { propsKey, code: _code } = resolvePropsKey(code)
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
  newScriptSetup += `\n${hasVariants || hasComputedStyles ? 'const { $pinceau } = ' : ''}usePinceauRuntime(computed(() => __$pProps), ${hasVariants ? '__$pVariants' : 'undefined'}, ${hasComputedStyles ? `ref({ ${Object.keys(computedStyles).map(key => `${key}`).join(',')} })` : 'undefined'})\n`

  return newScriptSetup
}
