<script setup lang="ts">
import { computedStyle, cssProp } from 'pinceau/runtime'

defineProps({
  palette: computedStyle('color', 'green', false),
  css: cssProp,
  ...variants,
})
</script>

<template>
  <button
    class="block"
  >
    <slot />
  </button>
</template>

<style lang="ts" scoped>
css({
  '.block': {
    backgroundColor: (props, utils) => utils.scale(
      'colors',
      props.palette,
      { light: '600', dark: '200' }
    ),
    borderColor: (props, utils) => utils.scale(
      'colors',
      props.palette,
      { light: '400', dark: '600' },
    ),
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: '320px',
    height: '320px',
    position: 'relative',
    color: 'black',
    '& > p': {
      fontSize: '16px',
      textDecoration: 'underline',
    },
  },
  variants: {
    shadow: {
      light: {
        boxShadow: '{shadows.sm}',
      },
      medium: {
        boxShadow: '{shadows.md}',
      },
      giant: {
        boxShadow: '{shadows.xl}',
      },
      options: {
        default: 'medium',
      }
    },
    bordered: {
      true: {
        borderRadius: '84px',
        borderStyle: 'solid',
        borderWidth: '4px',
      }
    }
  }
})
</style>

