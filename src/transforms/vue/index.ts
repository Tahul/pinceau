import { parse } from 'vue/compiler-sfc'
import type MagicString from 'magic-string'
import type { VueQuery } from '../../utils/vue'
import type { PinceauContext } from '../../types'
import { resolveDt } from '../dt'
import { resolveCssFunction } from '../css'
import { resolveStyle } from './style'
import { resolveVariantProps } from './variant-props'

export const resolveVueComponents = (code: string, id: string, magicString: MagicString, ctx: PinceauContext, query: VueQuery): { code: string; early: boolean } => {
  // Resolve from parsing the <style lang="ts"> tag for current component
  const variantProps = {}

  if (query.type === 'style') {
    code = resolveCssFunction(code, id, {}, ctx.$tokens)
    code = resolveStyle(code, ctx.$tokens)
    return { code, early: true }
  }

  // Parse component with compiler-sfc
  const parsedComponent = parse(code, { filename: id })

  // Run transforms in <template> tag
  if (parsedComponent.descriptor.template) {
    const templateContent = parsedComponent.descriptor.template
    let newTemplateContent = templateContent.content
    newTemplateContent = resolveDt(newTemplateContent, '\'')
    magicString.overwrite(templateContent.loc.start.offset, templateContent.loc.end.offset, newTemplateContent)
  }

  // Parse <style .*> blocks
  if (parsedComponent.descriptor.styles) {
    const styles = parsedComponent.descriptor.styles
    styles.forEach(
      (styleBlock) => {
        const { loc, content } = styleBlock
        let newStyle = content

        newStyle = resolveStyle(newStyle, ctx.$tokens)
        newStyle = resolveCssFunction(newStyle, id, variantProps, ctx.$tokens)

        magicString.remove(loc.start.offset, loc.end.offset)
        magicString.appendRight(
          loc.end.offset,
          `\n${newStyle}\n`,
        )
      },
    )
  }

  // Handles <script setup> ($dt(), $variantProps)
  if (parsedComponent.descriptor.scriptSetup) {
    const scriptSetup = parsedComponent.descriptor.scriptSetup
    let newScriptSetup = scriptSetup.content
    newScriptSetup = resolveDt(newScriptSetup, '`')
    newScriptSetup = resolveVariantProps(newScriptSetup, variantProps)
    magicString.overwrite(scriptSetup.loc.start.offset, scriptSetup.loc.end.offset, newScriptSetup)
  }

  return { code, early: false }
}

export * from './lang-ts'
