import type { PinceauContext } from '../types'
import { dtRegex } from '../utils/regexes'

/**
 * Resolve `$dt()` calls.
 *
 * Supports `wrapper` to be used in both `<style>` and `<script>` or `<template>` tags.
 */
export const transformDtHelper = (code: string, ctx: PinceauContext, wrapper: string | undefined = undefined) => {
  const replace = (content: string): string => `${wrapper || ''}${content}${wrapper || ''}`
  code = code.replace(dtRegex, (_, ...code) => {
    const path = code?.[0]
    const arg = code?.[2]

    // Use $token and arg if exist
    if (arg) {
      const token = ctx.$tokens(path, { key: arg || 'variable' })
      if (token) { return replace(token as string) }
    }

    return replace(`var(--${path.split('.').join('-')})`)
  })
  return code
}
