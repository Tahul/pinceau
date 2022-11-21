<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  color: {
    type: String as PropType<TokenOrThemeKey<'color'>>,
    default: '{colors.primary.600}',
  },
  ...variants,
})
</script>

<template>
  <button :class="{ ...$props }">
    <template v-for="[key, value] in Object.entries($props)" :key="key">
      <span>
        <pre v-if="value">{{ key }}: {{ JSON.stringify(value, null, 2) }}</pre>
        <br>
      </span>
    </template>
  </button>
  <button :class="{ ...$props }">
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
      border: (props) => `8px solid {colors.${props.color}}`,
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    borderRadius: '16px',
    width: '320px',
    height: '320px',
    border: '16px solid {colors.grey}',
    position: 'relative',
    '& > p': {
      fontSize: '16px',
      textDecoration: 'underline',
    }
  },
  variants: {
    shadow: {
      sm: {
        button: {
          boxShadow: '{shadows.sm}',
        }
      },
      lg: {
        button: {
          boxShadow: '{shadows.lg}',
        }
      },
      xl: {
        button: {
          boxShadow: '{shadows.xl}',
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

