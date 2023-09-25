import { resolveCssProperty, stringify } from '@pinceau/stringify'
import { toHash } from '@pinceau/core/runtime'
import type { PinceauRuntimeSheet, PinceauRuntimeSheetOptions } from '../types'
import { IS_BROWSER } from './constants'
import { useStyleSheet } from './sheet'

const HYDRATION_SELECTOR = '.phy[--]'

export const defaultRuntimeSheetOptions: PinceauRuntimeSheetOptions = {
  hydrate: IS_BROWSER,
}

export function getClassName(style: any) {
  return `pc-${toHash(style)}`
}

export function useRuntimeSheet(options?: PinceauRuntimeSheetOptions): PinceauRuntimeSheet {
  options = { ...defaultRuntimeSheetOptions, ...(options || {}) }

  const sheet = useStyleSheet('pinceau-runtime', IS_BROWSER ? document : undefined)

  const cache: Map<string, { rule: CSSRule; members: number }> = new Map()

  /**
   * Hydrate CSS rules from existing stylesheet.
   */
  const hydrate = () => {
    // Loop through SSR stylesheet CSS rules
    for (const cssRule of Object.entries(sheet?.cssRules || {})) {
      const [index, rule] = cssRule as [string, CSSMediaRule]
      const uid = resolveUid(rule)
      sheet.insertRule(rule.cssText, Number(index))
      cache.set(uid, { members: 0, rule })
    }
  }
  if (options?.hydrate) { hydrate() }

  /**
   * Stringify the stylesheet; to be used from SSR context.
   */
  function toString() {
    if (!sheet) { return '' }

    return Object.entries(sheet.cssRules).reduce(
      (acc, [, rule]: any) => {
        acc += `${rule?.cssText} ` || ''
        return acc
      },
      '',
    )
  }

  /**
   * Creates a rule group from a declaration and return a classname corresponding to that rule group.
   */
  function getRule(
    declaration: any,
    previousClass?: string | undefined,
    classWrap: boolean = true,
  ) {
    // Skip when sheet is missing
    if (!sheet) { return '' }

    // Skip when declaration is empty
    if (!Object.keys(declaration).length) { return '' }

    // Hash decl to get a className
    const className = getClassName(declaration)

    const cachedRule = cache.get(className)

    // Use hashed className to return cached rule
    if (cachedRule) {
      cachedRule.members++
      return className
    }

    // Group rule under `@media` ruleset
    if (classWrap) {
      declaration = { '@media': { [`.${className}`]: declaration } }
    }
    else {
      declaration = { '@media': declaration }
    }

    // Adds groups uid in the declaration
    declaration['@media'][HYDRATION_SELECTOR] = {}
    declaration['@media'][HYDRATION_SELECTOR]['--puid'] = className

    const stringified = stringify(
      declaration,
      stringifyContext => resolveCssProperty({
        stringifyContext,
        colorSchemeMode: options?.colorSchemeMode,
        utils: options?.utils,
        $theme: options?.themeSheet?.$theme,
      }),
    )

    const rule = sheet.insertRule(stringified, sheet?.cssRules?.length || 0)

    cache.set(className, { members: 1, rule: sheet.cssRules[rule] })

    // Flush previous rule if supplied and hits no members
    if (previousClass && previousClass !== className) {
      deleteMember(previousClass)
      flush(0, previousClass)
    }

    return className
  }

  /**
   * Removes a rule group from its unique identifier.
   */
  function deleteRule(rule: string) {
    if (!sheet) { return }

    const cachedRule = cache.get(rule)

    if (cachedRule) {
      const ruleIndex = Object.values(sheet.cssRules).findIndex(rule => rule === cachedRule.rule)
      if (ruleIndex > -1) { sheet?.deleteRule(ruleIndex) }
      cache.delete(rule)
    }
  }

  /**
   * Unregisters a rule group from its unique className identifier.
   *
   * Once `members` from a rule hits 0, it can be removed when `flush` gets called.
   */
  function deleteMember(className: string) {
    const cachedRule = cache.get(className)
    if (cachedRule) { cachedRule.members-- }
  }

  /**
   * Flushes out unused rules entries from the runtime stylesheet.
   */
  function flush(
    members: number = 0,
    className?: string,
  ): { rule: CSSRule; members: number }[] {
    const flushed: { rule: CSSRule; members: number }[] = []

    if (!sheet) { return flushed }

    // Single target flush
    if (className) {
      const targetRule = cache.get(className)
      if (!targetRule) { return [] }
      flushed.push(targetRule)
      if (targetRule.members <= members) { deleteRule(className) }
      return flushed
    }

    // Global flush
    cache.forEach((cachedRule, key) => {
      flushed.push(cachedRule)
      if (cachedRule.members <= members) { deleteRule(key) }
    })

    return flushed
  }

  return {
    sheet,
    cache,
    getRule,
    deleteRule,
    deleteMember,
    flush,
    hydrate,
    toString,
  }
}

/**
 * Resolve the uid and type from a rule.
 */
function resolveUid(rule: CSSMediaRule) {
  const uidRule: any = (rule.cssRules && rule.cssRules.length)
    ? Object.entries(rule.cssRules).find(([_, rule]: any) => rule.selectorText === HYDRATION_SELECTOR)
    : undefined

  if (!uidRule) { return }

  const [, uid] = uidRule[1].cssText.match(/--puid:\s*([^;\s]+)/)

  return uid
}
