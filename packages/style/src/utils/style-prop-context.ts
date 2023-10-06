import type { PinceauContext, PinceauTransformContext, PinceauTransformFunction, PropMatch } from '@pinceau/core'
import { evalDeclaration, expressionToAst } from '@pinceau/core/utils'
import { resolveCssProperty, stringify } from '@pinceau/stringify'
import type { CSSFunctionArgAST, PinceauStyleFunctionContext } from '../types/style-functions'
import { createUniqueClass } from './create-class'
import { resolveStyleArg } from './resolve-arg'

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
  const previousState = transformContext?.state?.styleFunctions?.[id] || transformContext?.previousState?.styleFunctions?.[id]

  const className = previousState?.className || createUniqueClass()

  const arg = expressionToAst(prop.content) as any as CSSFunctionArgAST

  const localTokens: PinceauStyleFunctionContext['localTokens'] = {}
  const variants: PinceauStyleFunctionContext['variants'] = {}
  const computedStyles: PinceauStyleFunctionContext['computedStyles'] = []

  // Search for function properties in css() AST
  resolveStyleArg(
    transformContext,
    arg,
    localTokens,
    computedStyles,
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
    { [`.${className}[pcsp]`]: declaration },
    stringifyContext => resolveCssProperty(
      {
        localTokens: Object.keys(localTokens),
        stringifyContext,
        $theme: pinceauContext.$theme,
        colorSchemeMode: pinceauContext.options.theme.colorSchemeMode,
        utils: pinceauContext.utils,
      },
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
    applied: {
      static: false,
      runtime: false,
    },
  }
}
