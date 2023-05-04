import type { PinceauContext, PinceauTransformContext } from '../types'
import { dtRegex } from '../utils/regexes'

interface TransformDtHelperOptions {
  wrapper?: string
}

/**
 * Resolve `$dt()` calls.
 *
 * Supports `wrapper` to be used in both `<style>` and `<script>` or `<template>` tags.
 */
export function transformDtHelper({ code }: Partial<PinceauTransformContext>,
  { $tokens }: Partial<PinceauContext>,
  options: TransformDtHelperOptions = {}): string {
  const replace = (content: string): string => `${options?.wrapper || ''}${content}${options?.wrapper || ''}`

  return code.replace(dtRegex, (_, ...code) => {
    const path = code?.[0]
    const arg = code?.[2]

    // Use $token and arg if exist
    if (arg) {
      const token = $tokens(path, { key: arg || 'variable' })
      if (token) { return replace(token as string) }
    }

    const replaced = replace(`var(--${path.split('.').join('-')})`)

    return replaced
  })
}
