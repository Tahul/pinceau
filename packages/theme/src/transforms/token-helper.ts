import type { PinceauTransformFunction } from '@pinceau/core'
import { helperRegex } from '../utils/helper-regex'

/**
 * Resolve `$dt()` calls.
 *
 * Supports `wrapper` to be used in both `<style>` and `<script>` or `<template>` tags.
 */
export const transformTokenHelper: PinceauTransformFunction = (
  transformContext,
  pinceauContext,
  wrapper: string = '',
) => {
  const wrap = (content: string): string => `${wrapper || ''}${content}${wrapper || ''}`

  const $tokens = pinceauContext.$tokens

  transformContext.target.toString().replace(
    helperRegex('$theme'),
    (...args) => {
      const path = args?.[1]
      const arg = args?.[0]
      const offset = args?.[4]

      // Create a var from the path
      let token = wrap(`var(--${path.split('.').join('-')})`)

      // Use $token and arg if exist
      if (arg) {
        const themeToken = $tokens(path)
        if (themeToken) { token = wrap(themeToken?.variable || path) }
      }

      transformContext.target.overwrite(offset, offset + arg.length, token)

      return token
    },
  )
}