import { dtRegex } from '../utils/regexes'

/**
 * Resolve `$dt()` calls.
 *
 * Supports `wrapper` to be used in both `<style>` and `<script>` or `<template>` tags.
 */
export const transformDtHelper = (code: string, wrapper: string | undefined = undefined) => {
  const replace = (path: string): string => `${wrapper || ''}var(--${path.split('.').join('-')})${wrapper || ''}`
  code = code.replace(dtRegex, (_, path) => replace(path))
  return code
}
