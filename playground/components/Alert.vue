<script setup lang="ts">
import type { PinceauTheme } from 'pinceau'
import { computedStyle } from 'pinceau/runtime'

defineProps({
  color: computedStyle<keyof PinceauTheme['color']>('red'),
  ...variants,
})
</script>

<template>
  <div class="alert">
    <slot />
  </div>
</template>

<style scoped lang="ts">
css({
  '.alert': {
    display: 'block',
    borderRadius: '{radii.lg}',
    borderWidth: '{borderWidth.md}',
    backgroundColor: (props) => `{color.${props.color}.500}`,
    color: (props) => `{color.${props.color}.200}`,
    borderColor: (props) => `{color.${props.color}.300}`
  },
  variants: {
    size: {
      small: {
        padding: '{space.6}',
        fontSize: '{fontSize.sm}'
      },
      medium: {
        padding: '{space.8}',
        fontSize: '{fontSize.sm}'
      },
      large: {
        padding: '{space.12}',
        fontSize: '{fontSize.md}'
      },
      options: {
        default: 'medium'
      }
    }
  }
})
</style>
