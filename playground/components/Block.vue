<script setup lang="ts">
import type { PropType } from 'vue'
import { computed } from 'vue'
import { cssProp } from 'pinceau/runtime'

defineProps({
  palette: {
    type: [String, Object] as PropType<ComputedStyleProp<'color'>>,
    required: true,
    default: 'green',
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
  <button
    class="block" :class="[$pinceau]" v-html="propsToHtml"
  />
</template>

<style lang="ts" scoped>
css({
  '.block': {
    backgroundColor: (props, utils) => utils.scale(
      'colors',
      props.palette,
      { light: '600', dark: '200' }
    ),
    border: (props, utils) => utils.scale(
      'colors',
      props.palette,
      { light: '600', dark: '200' },
      (token) => `6px solid ${token}`
    ),
    '&:hover': {
      border: (props, utils) => utils.scale(
        'colors',
        props.palette,
        { light: '700', dark: '300' },
        (token) => `10px solid ${token}`
      ),
    },
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    borderRadius: '16px',
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
        border: '2px solid {colors.blue.400}',
      },
      medium: {
        boxShadow: '{shadows.md}',
        border: '2px solid {colors.red.400}',
      },
      giant: {
        boxShadow: '{shadows.xl}',
        border: '2px solid {colors.green.400}',
      },
      options: {
        default: 'medium',
      }
    },
    bordered: {
      true: {
        borderRadius: '120px !important'
      }
    }
  }
})
</style>

