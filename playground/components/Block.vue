<script setup lang="ts">
import { computedStyle, cssProp } from 'pinceau/runtime'

defineProps({
  palette: computedStyle('red'),
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
      'color',
      props.palette,
      { light: '600', dark: '200' }
    ),
    borderColor: (props, utils) => utils.scale(
      'color',
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
    boxShadow: '{shadow.md}',
    '& > p': {
      fontSize: '16px',
      textDecoration: 'underline',
    }
  },
  variants: {
    shadow: {
      light: {
        boxShadow: '{shadow.sm}',
      },
      medium: {
        boxShadow: '{shadow.md}',
      },
      giant: {
        boxShadow: '{shadow.xl}',
      },
      options: {
        required: true,
        default: 'test'
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
