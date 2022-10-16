<script setup lang="ts">
import type { PropType } from 'vue'
import { computed } from 'vue'
import { cssProp } from 'pinceau/runtime'

defineProps({
  palette: {
    type: [String, Object] as PropType<ComputedStyleProp<'color'>>,
    default: '{colors.primary.600}',
  },
  css: cssProp,
  ...$variantsProps,
})

const propsToHtml = computed(
  () => {
    return Object.entries(__$pProps).map(
      ([key, value]) => {
        return `<b>⚙&nbsp;${key}</b>${typeof value === 'object' ? JSON.stringify(value) : value}<br />`
      },
    ).join('\n')
  },
)
</script>

<template>
  <button class="block" :class="[$pinceau]" v-html="propsToHtml" />
</template>

<style lang="ts" scoped>
css({
  '.block': {
    backgroundColor: (props, utils) => utils.scale('color', props.palette, '300'),
    '&:hover': {
      border: (props) => `8px solid {colors.${props.palette}}`,
    },
    display: 'flex',
    alignItems: 'center',
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
    },
    bordered: {
      true: {
        borderSize: '4px'
      },
      options: {
        default: true
      }
    }
  }
})
</style>

