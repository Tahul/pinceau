import type { PathMatch, PinceauContext, PinceauTransformContext, PinceauTransformFunction } from '@pinceau/core'
import { evalDeclaration } from '@pinceau/core/utils'
import { createSourceLocationFromOffsets } from 'sfc-composer'
import { resolveCssProperty, stringify } from '@pinceau/stringify'
import type { PinceauStyleFunctionContext } from '../types/style-functions'
import type { CSSFunctionSource } from '../types/ast'
import { createUniqueClass } from './create-class'
import { resolveStyleArg } from './resolve-arg'

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
    // Scope `declaration` in `className` when using `styled`
    type === 'styled' && className ? { [`.${className}`]: declaration } : declaration,
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
