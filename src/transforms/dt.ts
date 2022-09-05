import { kebabCase } from 'scule'

const dtRegex = /\$dt\('(.*?)'\)/g

/**
 * Resolve `$dt()` declarations.
 *
 * Supports `wrapper` to be used in both `<style>` and `<script>` or `<template>` tags.
 */
export const transformDt = (code: string, wrapper: string | undefined = undefined) => {
  const replace = (path: string): string => `${wrapper || ''}var(--${path.split('.').map(key => kebabCase(key)).join('-')})${wrapper || ''}`

  code = code.replace(dtRegex, (_, path) => replace(path))

  return code
}
