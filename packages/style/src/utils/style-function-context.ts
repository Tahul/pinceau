import type { PathMatch, PinceauContext, PinceauTransformContext, PinceauTransformFunction } from '@pinceau/core'
import { evalDeclaration, printAst, visitAst } from '@pinceau/core/utils'
import { createSourceLocationFromOffsets } from 'sfc-composer'
import { resolveCssProperty, stringify } from '@pinceau/stringify'
import type { PinceauStyleFunctionContext } from '../types/style-functions'
import type { CSSFunctionSource } from '../types/ast'
import type { SupportedHTMLElements } from '..'
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
  i: number = 0,
): PinceauStyleFunctionContext => {
  const { target } = transformContext

  const helpers: PinceauStyleFunctionContext['helpers'] = []

  let type: 'css' | 'styled' | '$styled' = 'css'

  let element: SupportedHTMLElements | undefined

  // $styled.div(...)
  if (callee.match[0].startsWith('$styled')) {
    const [, , tag] = callee.match
    element = tag as SupportedHTMLElements
    type = '$styled'
  }

  // styled(...)
  if (callee.match[0] === 'styled') { type = 'styled' }

  const id = `${target.type}${target.index}_${type}${i}`

  const previousState = transformContext?.state?.styleFunctions?.[id] || transformContext?.previousState?.styleFunctions?.[id]

  let className: string | undefined

  // Set className if `$styled` or `styled` has been used
  if (['$styled', 'styled'].includes(type)) { className = previousState?.className || createUniqueClass() }

  // Grab `*` in `css(*)`
  const arg = callee.value.arguments[0] as CSSFunctionSource

  const localTokens: PinceauStyleFunctionContext['localTokens'] = {}
  const variants: PinceauStyleFunctionContext['variants'] = {}
  const computedStyles: PinceauStyleFunctionContext['computedStyles'] = []

  // Create context
  const loc = createSourceLocationFromOffsets(
    transformContext.target.toString(),
    callee.value.start,
    callee.value.end,
  )

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
  // - Variants coming from `styled({ variants: { ... } })`
  if (declaration && declaration?.variants) {
    Object.assign(variants, { ...declaration.variants })
    delete declaration.variants
  }

  // - Variants coming from `$styled.a({}).withVariants({ ... })`
  if (callee.parent && type === '$styled') {
    visitAst(
      callee?.parent,
      {
        visitCallExpression(path) {
          // Filter out anything that has not a `MemberExpression`
          if (path.parentPath.value.type !== 'MemberExpression') {
            return this.traverse(path)
          }

          // Same pattern for all sub calls
          const propName = path?.parentPath?.value?.property?.name
          const propContent = path?.parentPath?.parentPath?.value?.arguments?.[0]

          // Skip empty cases
          if (!propName || !propContent) { return this.traverse(path) }

          // Grab `withVariants` content
          if (propName === 'withVariants') {
            // Set local variants content from helper
            const variantsDeclaration = evalDeclaration(propContent)
            Object.assign(variants, variantsDeclaration)
            helpers.push('withVariants')
          }

          // Grab `withProps` content
          if (propName === 'withProps') { helpers.push('withProps') }

          // Grab `withAttrs` content
          if (propName === 'withAttrs') { helpers.push('withAttrs') }

          return this.traverse(path)
        },
      },
    )
  }
  // Transform css() declaration to string
  const css = stringify(
    // Scope `declaration` in `className` when using `styled`
    ['$styled', 'styled'].includes(type) && className ? { [`.${className}`]: declaration } : declaration,
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

  const pointer: string = `$pinceau:${transformContext.query.filename}:${id}`

  return {
    id,
    element,
    helpers,
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
    applied: {
      static: false,
      runtime: false,
    },
  }
}
