<script setup lang="ts">
import type { PinceauTheme } from 'pinceau'
import { computedStyle } from 'pinceau/runtime'

defineProps({
  color: computedStyle<keyof PinceauTheme['color']>('primary'),
  ...variants,
})
</script>

<template>
  <button class="demo-button">
    <span>
      <slot />
    </span>
  </button>
</template>

<style scoped lang="ts">
css({
  '.demo-button': {
    '--button-primary': (props) => `{color.${props.color}.600}`,
    '--button-secondary': (props) => `{color.${props.color}.500}`,
    display: 'inline-block',
    borderRadius: '{radii.xl}',
    transition: '{transition.all}',
    color: '{color.white}',
    boxShadow: `0 5px 0 {button.primary}, 0 12px 16px {color.dimmed}`,
    span: {
      display: 'inline-block',
      fontFamily: '{font.secondary}',
      borderRadius: '{radii.lg}',
      fontSize: '{fontSize.xl}',
      lineHeight: '{lead.none}',
      transition: '{transition.all}',
      backgroundColor: '{button.primary}',
      boxShadow: 'inset 0 -1px 1px {color.dark}',
    },
    '&:hover': {
      span: {
        backgroundColor: '{button.secondary}',
      }
    },
    '&:active': {
      span: {
        transform: 'translateY({space.4})'
      }
    }
  },
  variants: {
    size: {
      sm: {
        span: {
          padding: '{space.6} {space.12}'
        }
      },
      md: {
        span: {
          padding: '{space.16} {space.20}'
        }
      }
    }
  }
})
</style>
