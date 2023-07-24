import { helperRegex } from '@pinceau/shared'
import type { PinceauContext } from '@pinceau/shared'
import type MagicString from 'magic-string'

/**
 * Resolve `$dt()` calls.
 *
 * Supports `wrapper` to be used in both `<style>` and `<script>` or `<template>` tags.
 */
export function transformTokenHelper(
  ms: MagicString,
  pinceauContext: PinceauContext,
  wrapper: string = '',
): string {
  const replace = (content: string): string => `${wrapper || ''}${content}${wrapper || ''}`

  return ms.toString().replace(
    helperRegex('$dt'),
    (_, ...code) => {
      const path = code?.[0]
      const arg = code?.[2]

      // Use $token and arg if exist
      if (arg) {
        const token = pinceauContext.$tokens(path, { key: arg || 'variable' })
        if (token) { return replace(token as string) }
      }

      const replaced = replace(`var(--${path.split('.').join('-')})`)

      return replaced
    },
  )
}
