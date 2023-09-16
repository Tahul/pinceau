import { kebabCase } from 'scule'

/**
 * Forked from https://github.com/stitchesjs/stitches/blob/canary/packages/stringify
 * Authors:
 * - [Pedro Duarte](https://twitter.com/peduarte)
 * - [Jonathan Neal](https://twitter.com/jon_neal)
 * - [Abdulhadi Alhallak](https://twitter.com/hadi_hlk)
 *
 * I had to fork this part to have control over it and add special integrations
 * for Vue like `v-bind()`, `:global`, and other `$` prefix.
 */

/** Comma matcher outside rounded brackets. */
const comma = /\s*,\s*(?![^()]*\))/

/** Returns selectors resolved from parent selectors and nested selectors. */
export function getResolvedSelectors(parentSelectors,
  /** @type {string[]} Nested selectors (e.g. `["&:hover", "&:focus"]`). */
  nestedSelectors) {
  return parentSelectors.reduce(
    (resolvedSelectors, parentSelector) => {
      resolvedSelectors.push(
        ...nestedSelectors.map(
          selector => (
            selector.includes('&')
              ? selector.replace(
                /&/g,
                (/[ +>|~]/.test(parentSelector) && /&.*&/.test(selector))
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
}

/* Grab object prototype to compare in the loop */
const { prototype: { toString } } = Object

/** Returns a string of CSS from an object of CSS. */
export function stringify(value,
  /** Replacer function. */
  replacer = undefined) {
  /** Set used to manage the opened and closed state of rules. */
  const used = new WeakSet()

  const write = (cssText, selectors, conditions, name, data, isAtRuleLike, isVariableLike) => {
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

    if (isAtRuleLike) {
      name = `${name} `
    }
    else if (isVariableLike) {
      name = `${name}:`
    }
    else {
      name = `${kebabCase(name)}:`
    }

    cssText += `${name + String(data)};`

    return cssText
  }

  const parse = (style, selectors, conditions, prevName?, prevData?) => {
    let cssText = ''

    for (const name in style) {
      const isAtRuleLike = name.charCodeAt(0) === 64
      const isVariableLike = (name.charCodeAt(0) === 45 && name.charCodeAt(1) === 45)

      for (const data of (isAtRuleLike && Array.isArray(style[name])) ? style[name] : [style[name]]) {
        if (replacer && (name !== prevName || data !== prevData)) {
          const next = replacer(name, data, style, selectors)

          if (next !== null) {
            cssText += (typeof next === 'object' && next) ? parse(next, selectors, conditions, name, data) : next == null ? '' : next

            continue
          }
        }

        const isObjectLike = typeof data === 'object' && data && data.toString === toString

        if (isObjectLike) {
          if (used.has(selectors)) {
            used.delete(selectors)

            cssText += '}'
          }

          const usedName = Object(name)

          let nextSelectors
          if (isAtRuleLike) {
            nextSelectors = selectors
            cssText += parse(
              data,
              nextSelectors,
              conditions.concat(usedName),
            )
          }
          else {
            nextSelectors = selectors.length
              ? getResolvedSelectors(selectors, name.split(comma))
              : name.split(comma)
            cssText += parse(
              data,
              nextSelectors,
              conditions,
            )
          }

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
          cssText = write(cssText, selectors, conditions, name, data, isAtRuleLike, isVariableLike)
        }
      }
    }

    return cssText
  }

  return parse(value, [], [])
}

export function stringifyKeyFrames(value) {
  if (!value) { return '' }
  let cssText = ''
  const { keyFrameDeclaration, keyFrameName } = value
  const animationKey = keyFrameName
  const animateRule: string[] = []
  Object.entries(keyFrameDeclaration).forEach(([key, content]) => {
    animateRule.push(`${key} ${JSON.stringify(content).replace(/'|"/g, '')}`)
  })
  cssText = `@keyframes ${animationKey} { ${animateRule.join(' ')} } `
  return cssText || ''
}
