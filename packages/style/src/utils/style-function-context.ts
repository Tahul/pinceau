import type { PathMatch, PinceauContext, PinceauTransformContext, PinceauTransformFunction } from '@pinceau/core'
import { evalDeclaration, visitAst } from '@pinceau/core/utils'
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

  const { id, type, element } = resolveStyleFunctionTypeIdElement(callee, target, i)

  const previousState = transformContext?.state?.styleFunctions?.[id] || transformContext?.previousState?.styleFunctions?.[id]

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

  let className: string | undefined

  // Set className if `$styled` or `styled` has been used
  if (['$styled', 'styled'].includes(type)) {
    className = previousState?.className || createUniqueClass()
  }

  // Handle variants and remove them from declaration
  const declaration = evalDeclaration(arg)

  // Prop names resolved from $styled.a<{ propName: ..., secondPropName: ... }>
  const propNames: string[] = []

  // Store variants and remove them from declarations as they are not part of stringifying process.

  // - Variants coming from `styled({ variants: { ... } })`
  if (declaration && declaration?.variants) {
    Object.assign(variants, { ...declaration.variants })
    delete declaration.variants
  }

  const declarationHasContent = Object.keys(declaration).length

  // No declaration content means no static styling, we do not need a static className in this case.
  if (!declarationHasContent) { className = undefined }

  if (callee.parent && type === '$styled') {
    // Resolve type arugment props if some is present.
    if (callee?.value?.typeParameters?.params?.[0]) {
      visitAst(
        callee.value.typeParameters.params[0],
        {
          visitTSPropertySignature(path) {
            if (path?.value?.key?.name) { propNames.push(path.value.key.name) }
            return this.traverse(path)
          },
        },
      )
    }

    // - Variants coming from `$styled.a({}).withVariants({ ... })`
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
  let css: string = ''
  if (declarationHasContent) {
    css = stringify(
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
  }

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
    propNames,
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

export function resolveStyleFunctionTypeIdElement(
  callee: PathMatch,
  { type: targetType, index: blockIndex }: Partial<PinceauTransformContext['target']>,
  fnIndex: number = 0,
) {
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

  const id = `${targetType}${blockIndex}_${type}${fnIndex}`

  return { type, id, element }
}
