import type { PinceauContext, PinceauTransformContext } from '@pinceau/core'
import { helperRegex } from '../regexes'

/**
 * Resolve `$dt()` calls.
 *
 * Supports `wrapper` to be used in both `<style>` and `<script>` or `<template>` tags.
 */
export function transformTokenHelper(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
  wrapper: string = '',
) {
  const wrap = (content: string): string => `${wrapper || ''}${content}${wrapper || ''}`

  transformContext.ms.toString().replace(
    helperRegex('$dt'),
    (...args) => {
      const path = args?.[1]
      const arg = args?.[0]
      const offset = args?.[4]

      let token = wrap(`var(--${path.split('.').join('-')})`)

      // Use $token and arg if exist
      if (arg) {
        const themeToken = pinceauContext.$tokens(path, { key: arg || 'variable' })
        if (themeToken) { token = wrap(themeToken as string) }
      }

      transformContext.ms.overwrite(offset, offset + arg.length, token)

      return token
    },
  )
}
