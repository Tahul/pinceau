import type { Sfc } from '@volar/vue-language-core'
import { evalDeclaration, findCallees, parseAst, pathToVarName, referencesRegex, visitAst } from '@pinceau/core/utils'
import type { CSSFunctionArgAST } from '@pinceau/style'
import { isPropertyValueType } from '@pinceau/style/utils'
import { defu } from 'defu'
import type { PathMatch } from '@pinceau/core'
import { resolveVariantsProps } from '@pinceau/vue/transforms'

import type { PinceauVolarFileContext } from './index'

export function resolveEmbeddedFileContext(
  sfc: Sfc,
  ctx: PinceauVolarFileContext,
) {
  resolveCallees(sfc, (callee, argAst, cssContent) => {
    // Resolve variants as object
    if (cssContent?.variants) {
      ctx.variantsObject = defu(ctx?.variantsObject || {}, cssContent?.variants || {})
      delete cssContent.variants
    }

    // Resolve local tokens
    visitAst(
      argAst,
      {
        visitObjectProperty(path) {
          if (path.value) {
            // Resolve path key
            const key = path?.value?.key?.name || path?.value?.key?.value

            // Store local tokens
            if (key.startsWith('$') && isPropertyValueType(path)) { ctx.localTokens.push(key) }
          }

          // Resolve tokens used in the declaration
          if (path?.value?.value?.type === 'StringLiteral') {
            path.value.value.value.replace(
              referencesRegex,
              (_, tokenPath) => {
                ctx.usedTokens.push(pathToVarName(tokenPath, '$', '.', '.'))
                return _
              },
            )
          }

          return this.traverse(path)
        },
      },
    )
  })

  if (ctx.variantsObject && Object.keys(ctx.variantsObject).length) { ctx.variantsProps = resolveVariantsProps(ctx.variantsObject, true) }
}

/**
 * Resolve `css` calees found in `<style>` blocks.
 */
function resolveCallees(
  sfc: Sfc,
  cb?: (callee: PathMatch, argAst: CSSFunctionArgAST, content: any) => void,
) {
  for (let i = 0; i < sfc.styles.length; i++) {
    const style = sfc.styles[i]

    try {
      // Check if <style> tag is `lang="ts"`
      if (style.lang === 'ts') {
        const ast = parseAst(style.content)
        const callees = findCallees(ast, 'css')

        for (let i = 0; i <= callees.length; i++) {
          const callee = callees[i]
          const ast = callee.value.arguments[0] as CSSFunctionArgAST
          const cssContent = evalDeclaration(ast)
          if (cb) { (cb(callee, ast, cssContent)) }
        }
      }
    }
    catch (e) {
      // Do not catch errors at this stage
    }
  }
}
