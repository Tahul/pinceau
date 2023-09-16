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
const test = keyFrames({
    from: {
        transform: 'scale(1)'
    },
    to: {
        transform: 'scale(1.2)'
    }
})
css({
  '.demo-button': {
    '--button-primary': (props) => `{color.${props.color}.600}`,
    '--button-secondary': (props) => `{color.${props.color}.500}`,
    display: 'inline-block',
    borderRadius: '{radii.xl}',
    transition: '{transition.all}',
    color: '{color.white}',
    boxShadow: `0 5px 0 {button.primary}, 0 12px 16px {color.dimmed}`,
    animation: `3s linear 1s ${test} infinite`,
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
          padding: '{space.4} {space.6}',
        },
      },
      md: {
        span: {
          padding: '{space.6} {space.8}'
        },
      },
      lg: {
        span: {
          padding: '{space.8} {space.12}'
        },
      },
      xl: {
        span: {
          padding: '{space.12} {space.24}'
        },
      },
      options: {
        default: {
          initial: 'sm',
          md: 'md',
          lg: 'lg',
          xl: 'xl'
        },
      },
    },
  },
})
</style>
