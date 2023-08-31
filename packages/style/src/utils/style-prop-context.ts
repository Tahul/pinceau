import { camelCase, kebabCase } from 'scule'
import type { PinceauContext, PinceauTransformContext, PinceauTransformFunction, PropMatch } from '@pinceau/core'
import { astTypes, evalDeclaration, expressionToAst, printAst, visitAst } from '@pinceau/core/utils'
import { resolveCssProperty, stringify } from '@pinceau/stringify'
import { nanoid } from 'nanoid'
import type { CSSFunctionArg, PinceauStyleFunctionContext } from '../types/style-functions'
import { createUniqueClass } from './create-class'

/**
 * Resolve transform context runtime features from `css()` function.
 *
 * Useful for frameworks runtime engine integrations.
 */
export const resolveStylePropContext: PinceauTransformFunction<PinceauStyleFunctionContext> = (
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
  prop: PropMatch,
  id: string,
): PinceauStyleFunctionContext => {
  const previousState = transformContext?.state?.styleFunctions?.[id]

  const className = previousState?.className || createUniqueClass()

  const arg = expressionToAst(prop.content) as any as CSSFunctionArg

  const localTokens: PinceauStyleFunctionContext['localTokens'] = {}
  const variants: PinceauStyleFunctionContext['variants'] = {}
  const computedStyles: PinceauStyleFunctionContext['computedStyles'] = []

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
            // As collision rate in this kind of context is extremely improbable the UID is very short.
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
    { [`.${className}`]: declaration },
    stringifyContext => resolveCssProperty(
      stringifyContext,
      pinceauContext,
    ),
  )

  const pointer: string = `class="${className || ''}"`

  return {
    type: 'styled',
    callee: prop,
    arg,
    loc: prop.loc,
    pointer,
    className,

    css,
    declaration,
    variants,
    computedStyles,
    localTokens,
  }
}
