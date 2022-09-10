import { kebabCase } from 'scule'

/**
 * Forked from https://github.com/stitchesjs/stitches/blob/canary/packages/stringify
 * Authors:
 * - [Pedro Duarte](https://twitter.com/peduarte)
 * - [Jonathan Neal](https://twitter.com/jon_neal)
 * - [Abdulhadi Alhallak](https://twitter.com/hadi_hlk)
 */

/** Comma matcher outside rounded brackets. */
const comma = /\s*,\s*(?![^()]*\))/

/** Returns selectors resolved from parent selectors and nested selectors. */
export const getResolvedSelectors = (
  /** @type {string[]} Parent selectors (e.g. `["a", "button"]`). */
  parentSelectors,
  /** @type {string[]} Nested selectors (e.g. `["&:hover", "&:focus"]`). */
  nestedSelectors,
) => (
  parentSelectors.reduce(
    (resolvedSelectors, parentSelector) => {
      resolvedSelectors.push(
        ...nestedSelectors.map(
          selector => (
            selector.includes('&')
              ? selector.replace(
                /&/g,
                /[ +>|~]/.test(parentSelector) && /&.*&/.test(selector)
                  ? `:is(${parentSelector})`
                  : parentSelector,
              )
              : `${parentSelector} ${selector}`
          ),
        ),
      )

      return resolvedSelectors
    },
    [],
  )
)

/* Grab object prototype to compare in the loop */
const { prototype: { toString } } = Object

/** Returns a string of CSS from an object of CSS. */
export const stringify = (
  /** Object representing the current CSS. */
  value,
  /** Replacer function. */
  replacer = undefined,
) => {
  /** Set used to manage the opened and closed state of rules. */
  const used = new WeakSet()

  const parse = (style, selectors, conditions, prevName?, prevData?) => {
    let cssText = ''

    for (let name in style) {
      // Support both `@` and `$` as atRuleLike values
      const isAtRuleLike = name.charCodeAt(0) === 64 || name.charCodeAt(0) === 36

      for (const data of isAtRuleLike && Array.isArray(style[name]) ? style[name] : [style[name]]) {
        if (replacer && (name !== prevName || data !== prevData)) {
          const next = replacer(name, data, style)

          if (next !== null) {
            cssText += typeof next === 'object' && next ? parse(next, selectors, conditions, name, data) : next == null ? '' : next

            continue
          }
        }

        const isObjectLike = typeof data === 'object' && data && data.toString === toString

        // Strip `$` unwrapping char
        if (name.charCodeAt(0) === 36) {
          name = name.slice(1, name.length)
        }

        if (isObjectLike) {
          if (used.has(selectors)) {
            used.delete(selectors)

            cssText += '}'
          }

          const usedName = Object(name)

          const nextSelectors = isAtRuleLike ? selectors : selectors.length ? getResolvedSelectors(selectors, name.split(comma)) : name.split(comma)

          cssText += parse(
            data,
            nextSelectors,
            isAtRuleLike ? conditions.concat(usedName) : conditions,
          )

          if (used.has(usedName)) {
            used.delete(usedName)
            cssText += '}'
          }

          if (used.has(nextSelectors)) {
            used.delete(nextSelectors)
            cssText += '}'
          }
        }
        else {
          for (let i = 0; i < conditions.length; ++i) {
            if (!used.has(conditions[i])) {
              used.add(conditions[i])

              cssText += `${conditions[i]}{`
            }
          }

          if (selectors.length && !used.has(selectors)) {
            used.add(selectors)

            cssText += `${selectors}{`
          }

          cssText += `${(isAtRuleLike ? `${name} ` : `${kebabCase(name)}:`) + String(data)};`
        }
      }
    }

    return cssText
  }

  return parse(value, [], [])
}
