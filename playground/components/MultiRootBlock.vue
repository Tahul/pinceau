<script setup lang="ts">
import { computedStyle } from 'pinceau/runtime'
import type { PropType } from 'vue'

defineProps({
  color: computedStyle('color', 'red', false),
  ...variants,
})
</script>

<template>
  <button :class="[{ ...$props }, $pinceau]">
    <template v-for="[key, value] in Object.entries($props)" :key="key">
      <span>
        <pre v-if="value">{{ key }}: {{ JSON.stringify(value, null, 2) }}</pre>
        <br>
      </span>
    </template>
  </button>
  <button :class="[{ ...$props  }, $pinceau]">
    <template v-for="[key, value] in Object.entries($props)" :key="key">
      <span>
        <pre v-if="value">{{ key }}: {{ JSON.stringify(value, null, 2) }}</pre>
        <br>
      </span>
    </template>
  </button>
</template>

<style lang="ts" scoped>
css({
  button: {
    backgroundColor: (props, utils) => utils.scale('color', props.color, '600'),
    '&:hover': {
      border: (props) => `8px solid {color.${props.color}}`,
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    borderRadius: '16px',
    width: '320px',
    height: '320px',
    border: '16px solid {color.grey.500}',
    position: 'relative',
    '& > p': {
      fontSize: '16px',
      textDecoration: 'underline',
    },
  },
  variants: {
    shadow: {
      sm: {
        button: {
          boxShadow: '{shadow.sm}',
        }
      },
      lg: {
        button: {
          boxShadow: '{shadow.lg}',
        }
      },
      xl: {
        button: {
          boxShadow: '{shadow.xl}',
        }
      }
    },
    padded: {
      true: {
        button: {
          padding: '64px',
        }
      }
    }
  }
})
</style>

