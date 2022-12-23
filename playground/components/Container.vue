<script setup lang="ts">
import type { PropType } from 'vue'

type HTMLElementsTags = keyof HTMLElementTagNameMap

defineProps({
  as: {
    type: String as PropType<HTMLElementsTags>,
    required: false,
    default: 'div',
  },
  ...variants,
})
</script>

<template>
  <component :is="as" class="container">
    <slot />
  </component>
</template>

<style lang="ts" scoped>
css({
  '.container': {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    height: '100%'
  },
  variants: {
    padded: {
      true: {
        px: '{space.32}',
        '@sm': {
          px: '{space.48}',
        },
        '@md': {
          px: '{space.64}',
        }
      },
      options: {
        default: true
      }
    },
    fluid: {
      true: {},
      false: {
        maxWidth: '100vw'
      },
      options: {
        default: false
      }
    }
  }
})
</style>
