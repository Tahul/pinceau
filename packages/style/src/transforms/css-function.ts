import { parse } from 'acorn'
import type { PinceauContext, PinceauSFCTransformContext } from '@pinceau/core'
import { message } from '@pinceau/core'
import { stringify } from '../stringify'
import { resolveCssProperty } from '../css'
import { resolveRuntimeContext } from '../runtime-context'
import { resolveCssCallees } from '../ast'
import { evalCssDeclaration } from '../eval'

/**
 * Stringify every call of css() into a valid Vue <style> declaration.
 */
export function transformCssFunction(
  transformContext: PinceauSFCTransformContext,
  pinceauContext: PinceauContext,
) {
  const code = transformContext.code

  // Enhance error logging for `css()`
  try {
    parse(code, { ecmaVersion: 'latest' })
  }
  catch (e: any) {
    if (e.loc) { e.loc.line = (transformContext?.loc?.start?.line + e?.loc?.line) - 1 }
    const filePath = `${transformContext.query.id.split('?')[0]}:${e?.loc?.line}:${e?.loc?.column}`
    message('TRANSFORM_ERROR', [filePath, e])
    return
  }

  // Resolve stringifiable declaration from `css()` content
  resolveCssCallees(
    code,
    (ast) => {
      const value = ast.value.arguments[0]

      // Get declaration object
      const declaration = evalCssDeclaration(value)

      // Resolve runtime styling context from AST of css() call
      resolveRuntimeContext(value, transformContext)

      // Transform css() declaration to string
      const cssContent = stringify(
        declaration,
        stringifyContext => resolveCssProperty(
          stringifyContext,
          pinceauContext,
          transformContext,
        ),
      )

      // Overwrite css() function with stringified CSS result
      if (transformContext.loc && ast.value.loc) {
        transformContext.ms.overwrite(
          transformContext.loc.start.offset + ast.value.loc.start.index,
          transformContext.loc.start.offset + ast.value.loc.end.index,
          cssContent,
        )
      }
    },
  )
}
