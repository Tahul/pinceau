<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  color: {
    type: String as PropType<ThemeKey<'color'> | keyof PinceauTheme['colors']>,
    default: '{colors.primary.600}',
  },
  ...$variantsProps,
})
</script>

<template>
  <button class="block">
    <pre>{{ JSON.stringify($props, null, 2) }}</pre>
  </button>
</template>

<style lang="ts" scoped>
css({
  '.block': {
    marginTop: '1rem',
    backgroundColor: (props, utils) => {
      if (props.color && utils.isToken(props.color)) return props.color
      return props.color
    },
    '&:hover': {
      border: (props) => `8px solid {colors.${props.color}}`,
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    borderRadius: '16px',
    width: '320px',
    height: '320px',
    border: '4px solid {colors.gray.600}',
    position: 'relative',
    '& > p': {
      fontSize: '16px',
      textDecoration: 'underline',
    }
  },
  variants: {
    shadow: {
      light: {
        boxShadow: '{shadows.sm}'
      },
      medium: {
        boxShadow: '{shadows.md}'
      },
      giant: {
        boxShadow: '{shadows.xl}'
      }
    }
  }
})
</style>

