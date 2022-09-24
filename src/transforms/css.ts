import chalk from 'chalk'
import * as recast from 'recast'
import color from 'tinycolor2'
import type { ASTNode } from 'ast-types'
import defu from 'defu'
import { hash } from 'ohash'
import { logger, referencesRegex, rgbaRegex, stringify } from '../utils'
import type { DesignToken, TokensFunction } from '../types'

/**
 * Stringify every call of css() into a valid Vue <style> declaration.
 */
export const transformCssFunction = (
  code = '',
  id: string,
  variantsProps: any | undefined,
  computedStyles: any | undefined,
  $tokens: TokensFunction,
) => {
  try {
    const declaration = resolveCssCallees(
      code,
      ast => resolveComputedStyles(ast, computedStyles),
    )

    const style = stringify(
      declaration,
      (property: any, value: any) => resolveCssProperty(property, value, $tokens, variantsProps),
    )

    if (style) { code = style }
  }
  catch (e) {
    return code
  }

  return code
}

/**
 * Resolve a css function property to a stringifiable declaration.
 */
export function resolveCssProperty(property: any, value: any, $tokens: TokensFunction, variantsProps: any) {
  // Resolve custom style directives
  const directive = resolveCustomDirectives(property, value, $tokens)
  if (directive) { return directive }

  // Push variants to variantsProps
  if (variantsProps && value?.variants) { resolveVariantsProps(property, value?.variants || {}, variantsProps) }

  // Transform variants to nested selectors
  if (property === 'variants') { return resolveVariants(property, value) }

  // Resolve final value
  value = castValues(property, value, $tokens)

  // Return proper declaration
  return {
    [property]: value,
  }
}

/**
 * Cast a value to a valid CSS unit.
 */
export function castValue(property: any, value: any, $tokens: TokensFunction) {
  if (typeof value === 'number') { return value }

  value = resolveRgbaTokens(property, value, $tokens)

  value = resolveReferences(property, value, $tokens)

  if (value === '{}') { return '' }

  return value
}

/**
 * Resolve custom directives (@screen, @dark).
 */
export function resolveCustomDirectives(property: any, value: any, $tokens: TokensFunction) {
  if (property.startsWith('@')) {
    const DARK = '@dark'
    const LIGHT = '@light'
    const SCREEN = /@screen:(.*)/
    const screenMatches = property.match(SCREEN)

    if (property === DARK) {
      return {
        '@media (prefers-color-scheme: dark)': value,
      }
    }

    if (property === LIGHT) {
      return {
        '@media (prefers-color-scheme: light)': value,
      }
    }

    if (screenMatches) {
      const screen = screenMatches[1]
      const screenToken = $tokens(`screens.${screen}` as any, { key: undefined })
      const tokenValue = (screenToken as any)?.original?.value

      if (!tokenValue) {
        logger.warn(`This screen size is not defined: ${chalk.red(screen)}\n`)
      }

      return {
        [`@media (min-width: ${tokenValue || '0px'})`]: value,
      }
    }
  }
}

/**
 * Transform a variants property to nested selectors.
 */
export function resolveVariants(property: any, value: any) {
  return Object.entries(value).reduce(
    (acc: any, [key, value]) => {
      acc[`&.${key}`] = value
      return acc
    },
    {},
  )
}

/**
 * Find all calls of css() and call a callback on each.
 */
export function resolveCssCallees(code: string, cb: (ast: ASTNode) => any) {
  const ast = recast.parse(
    code,
    {
      parser: require('recast/parsers/typescript'),
    },
  )

  let result = {}
  recast.visit(ast, {
    visitCallExpression(path: any) {
      if (path.value.callee.name === 'css') {
        result = defu(result, cb(path.value.arguments[0]))
      }
      return this.traverse(path)
    },
  })

  return result
}

/**
 * Resolve computed styles found in css() declaration.
 */
export function resolveComputedStyles(cssAst: ASTNode, computedStyles: any) {
  if (!computedStyles) { return }

  // Search for function properties in css() AST
  recast.visit(
    cssAst,
    {
      visitObjectProperty(path) {
        if (path.value) {
          const valueType = path.value.value.type

          if (valueType === 'ArrowFunctionExpression' || valueType === 'FunctionExpression') {
            const id = `${hash(path.value.loc.start)}-${path.value.key.name}`

            // Push property function to computedStyles
            computedStyles[id] = recast.print(path.value.value.body).code

            path.replace(
              recast.types.builders.objectProperty(
                path.value.key,
                recast.types.builders.stringLiteral(`v-bind(_$cst['${id}'].value)`),
              ),
            )
          }
        }
        return this.traverse(path)
      },
    },
  )

  // eslint-disable-next-line no-eval
  const _eval = eval
  // const transformed = transform({ source: recast.print(ast).code })
  _eval(`var cssDeclaration = ${recast.print(cssAst).code}`)
  // @ts-expect-error - Evaluated code
  return cssDeclaration
}

/**
 * Cast value or values before pushing it to the style declaration
 */
export function castValues(property: any, value: any, $tokens: TokensFunction) {
  if (Array.isArray(value) || typeof value === 'string' || typeof value === 'number') {
    if (Array.isArray(value)) {
      value = value.map(v => castValue(property, v, $tokens)).join(',')
    }
    else {
      value = castValue(property, value, $tokens)
    }
  }
  return value
}

/**
 * Push variants to to variantsProps object.
 */
export function resolveVariantsProps(property: string, value: any, variantsProps: any) {
  variantsProps[property] = Object.entries(value).reduce(
    (acc: any, [key, _]) => {
      acc[key] = {
        type: Boolean,
        required: false,
        default: false,
      }
      return acc
    },
    {},
  )
}

/**
 * Resolve token references
 */
export function resolveReferences(property: string, value: string, $tokens: TokensFunction) {
  value = value.replace(
    referencesRegex,
    (...parts) => {
      const [, tokenPath] = parts

      const token = $tokens(tokenPath, { key: undefined }) as DesignToken

      const tokenValue = token?.attributes?.variable || token?.value || token?.original?.value

      if (!tokenValue) { return '' }

      return tokenValue
    },
  )

  return value
}

/**
 * Resolve rgba() value properly
 */
export function resolveRgbaTokens(property: string, value: string, $tokens: TokensFunction) {
  value = value.replace(
    rgbaRegex,
    (...parts) => {
      let newValue = parts[0]

      newValue = newValue.replace(
        referencesRegex,
        (...reference) => {
          const [, referencePath] = reference

          const token = $tokens(referencePath, { key: undefined }) as DesignToken

          let tokenValue = token?.value || token?.original?.value

          if (!tokenValue) { return '0,0,0' }

          tokenValue = color(tokenValue).toRgb()

          return `${tokenValue.r},${tokenValue.g},${tokenValue.b}`
        },
      )

      return newValue
    },
  )

  return value
}
