<script setup lang="ts">
import type { PropType } from 'vue'
import { usePinceauRuntime } from 'pinceau/runtime'

const props = defineProps({
  color: {
    type: String as PropType<ThemeKey<'color'> | keyof PinceauTheme['colors']>,
  },
})

const pinceauRuntime = usePinceauRuntime()

console.log({ pinceauRuntime })
</script>

<template>
  <button :class="{ ...$props }">
    <template v-for="[key, value] in Object.entries($props)">
      <p v-if="value" :key="key">
        {{ color }}
      </p>
    </template>
  </button>
</template>

<style lang="ts" scoped>
css({
  button: {
    backgroundColor: (props) => {
      if (props.color.startsWith('{')) {
        return props.color
      }
      return `var(--colors-${props.color})`
    },
    '&:hover': {
      border: (props) => `8px solid {colors.${props.color}}`,
    },
    boxShadow: '{shadows.sm}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
    width: '320px',
    height: '320px',
    border: '16px solid {colors.grey}',
    position: 'relative',
    '& > p': {
      fontSize: '16px',
      textDecoration: 'underline',
    }
  }
})
</style>

