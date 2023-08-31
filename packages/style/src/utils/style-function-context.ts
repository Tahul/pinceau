import { camelCase, kebabCase } from 'scule'
import type { PathMatch, PinceauContext, PinceauTransformContext, PinceauTransformFunction } from '@pinceau/core'
import { astTypes, evalDeclaration, printAst, visitAst } from '@pinceau/core/utils'
import { createSourceLocationFromOffsets } from 'sfc-composer'
import { resolveCssProperty, stringify } from '@pinceau/stringify'
import { nanoid } from 'nanoid'
import type { PinceauStyleFunctionContext } from '../types/style-functions'
import type { CSSFunctionSource } from '../types/ast'
import { createUniqueClass } from './create-class'

/**
 * Resolve transform context runtime features from `css()` function.
 *
 * Useful for frameworks runtime engine integrations.
 */
export const resolveStyleFunctionContext: PinceauTransformFunction<PinceauStyleFunctionContext> = (
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
  callee: PathMatch,
  id: string,
): PinceauStyleFunctionContext => {
  const previousState = transformContext?.state?.styleFunctions?.[id]

  // Resolve type
  const type = Array.isArray(callee.match) ? 'styled' : 'css'

  let className: string | undefined
  if (type === 'styled') { className = previousState?.className || createUniqueClass() }

  // Grab `*` in `css(*)`
  const arg = callee.value.arguments[0] as CSSFunctionSource

  const localTokens: PinceauStyleFunctionContext['localTokens'] = {}
  const variants: PinceauStyleFunctionContext['variants'] = {}
  const computedStyles: PinceauStyleFunctionContext['computedStyles'] = []

  // Create context
  const loc = createSourceLocationFromOffsets(transformContext.target.toString(), callee.value.start, callee.value.end)

  // Search for function properties in css() AST
  visitAst(
    arg,
    {
      visitObjectProperty(path) {
        if (path.value) {
          // Resolve path key & type
          const key = path?.value?.key?.name || path?.value?.key?.value
          const valueType = path?.value?.value?.type

          // Store local tokens
          if (key.startsWith('--')) { localTokens[key] = path.value.value }

          // Store computed styles in state
          if (valueType === 'ArrowFunctionExpression' || valueType === 'FunctionExpression') {
            // Local UID is used to avoid collision of names if there is plenty of computed styles in the same component.
            // As collision rate in this kind of context is extremely improbable, the UID is very short.
            const uid = nanoid(3).toLowerCase()

            // Create computed styles identifiers
            const computedStyleKey = camelCase((key).replace(/--/g, '__'))
            const id = `pcs_${uid}_${computedStyleKey}`
            const variable = `--${kebabCase(id)}`

            // Push property function to computedStyles
            computedStyles.push({
              id,
              variable,
              ast: path.value.value.body,
              compiled: printAst(path.value.value).code,
            })

            // Overwrite function in declaration by the CSS variable.
            path.replace(
              astTypes.builders.objectProperty(
                path.value.key,
                astTypes.builders.stringLiteral(`var(${variable})`),
              ),
            )
          }
        }

        return this.traverse(path)
      },
    },
  )

  // Handle variants and remove them from declaration
  const declaration = evalDeclaration(arg)

  // Store variants and remove them from declarations as they are not part of stringifying process.
  if (declaration && declaration?.variants) {
    Object.assign(variants, { ...declaration.variants })
    delete declaration.variants
  }

  // Transform css() declaration to string
  const css = stringify(
    // Scope `declaration` in `className` when using `styled`
    type === 'styled' && className ? { [`.${className}`]: declaration } : declaration,
    stringifyContext => resolveCssProperty(
      stringifyContext,
      pinceauContext,
    ),
  )

  let pointer: string = `$pinceau:${transformContext.query.filename}:${id}`
  // If it is a style, replace with comment pointer
  if (transformContext.target.type === 'style') { pointer = `\n/* ${pointer} */` }
  // If it is a class, replace with a class name is available, or an empty string
  if (transformContext.target.type === 'script') {
  // Check if the style function declaration has a variable declarator
    const hasVariableDeclarator = callee?.parentPath?.value?.type === 'VariableDeclarator'
    // Define the pointer to className or empty string if there is a declarator, otherwise no pointer needed for <script> contexts
    pointer = hasVariableDeclarator ? `\`${className || ''}\`` : ''
  }

  return {
    type,
    callee,
    arg,
    loc,
    pointer,

    className,
    css,
    declaration,
    variants,
    computedStyles,
    localTokens,
  }
}
