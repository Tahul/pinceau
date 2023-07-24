import type { ASTNode, namedTypes } from 'ast-types'
import { defu } from 'defu'
import { parse } from 'acorn'
import type { NodePath } from 'ast-types/lib/node-path'
import type { PinceauContext, PinceauSFCTransformContext } from '@pinceau/shared'
import { astTypes, message, parseAst, printAst, resolveCssProperty, stringify, visitAst } from '@pinceau/shared'

import { hash } from 'ohash'
import { camelCase, kebabCase } from 'scule'

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
      resolveRuntimeContext(value, declaration, transformContext)

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
        transformContext.magicString.overwrite(
          transformContext.loc.start.offset + ast.value.loc.start.index,
          transformContext.loc.start.offset + ast.value.loc.end.index,
          cssContent,
        )
      }
    },
  )
}

/**
 * Find all calls of css() and call a callback on each.
 */
export function resolveCssCallees(code: string, cb: (ast: NodePath<namedTypes.CallExpression, any>) => void): any {
  const ast = parseAst(code)

  visitAst(ast, {
    visitCallExpression(path) {
      if (path.value.callee.name === 'css') { cb(path) }
      return this.traverse(path)
    },
  })
}

/**
 * Resolve transform context runtime features from `css()` function.
 *
 * Useful for frameworks runtime engine integrations.
 */
export function resolveRuntimeContext(
  cssFunctionAst: ASTNode,
  declaration: any,
  transformContext: PinceauSFCTransformContext,
) {
  // Search for function properties in css() AST
  visitAst(
    cssFunctionAst,
    {
      visitObjectProperty(path) {
        if (path.value) {
          // Resolve path key
          const key = path?.value?.key?.name || path?.value?.key?.value

          const valueType = path?.value?.value?.type

          // Store variable tokens in local map
          if (key.startsWith('--') && transformContext.localTokens && !transformContext.localTokens[key]) { transformContext.localTokens[key] = path.value.value }

          // Store computed styles in local map
          if (valueType === 'ArrowFunctionExpression' || valueType === 'FunctionExpression') {
            const computedStyleKey = camelCase((key).replace(/--/g, '__'))
            const id = `_${hash(path.value.loc.start).slice(0, 3)}_${computedStyleKey}`

            // Push property function to computedStyles
            if (transformContext.computedStyles) { transformContext.computedStyles[id] = printAst(path.value.value.body).code }

            path.replace(
              astTypes.builders.objectProperty(
                path.value.key,
                astTypes.builders.stringLiteral(`var(--${kebabCase(id)})`),
              ),
            )
          }
        }
        return this.traverse(path)
      },
    },
  )

  // Remove variants from declaration and drop the key
  if (declaration && declaration?.variants) {
    transformContext.variants = defu(transformContext?.variants || {}, declaration.variants)
    delete declaration.variants
  }
}

/**
 * Resolve computed styles found in css() declaration.
 */
export function evalCssDeclaration(cssAst: ASTNode) {
  try {
    // eslint-disable-next-line no-eval
    const _eval = eval

    // const transformed = transform({ source: recast.print(ast).code })
    _eval(`var cssDeclaration = ${printAst(cssAst).code}`)

    // @ts-expect-error - Evaluated code
    return cssDeclaration
  }
  catch (e) {
    return {}
  }
}
