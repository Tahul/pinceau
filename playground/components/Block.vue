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
        if (!value) { return '' }
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

