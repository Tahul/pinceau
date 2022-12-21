<script setup lang="ts">
import { theme } from '#pinceau/theme'

const mediaQueries = Object.entries(theme).reduce(
  (acc, [key, value]) => {
    if (key.startsWith('media.')) { return { ...acc, [key.replace('media.', '')]: value } }
    return acc
  },
  {},
)
</script>

<template>
  <div>
    <span v-for="[key] of Object.entries(mediaQueries)" :key="key" :class="`bp-${key}`">
      {{ key }}
    </span>
  </div>
</template>

<style lang="ts" scoped>
css({
  '.bp-sm': {
    display: 'block',
    '@md': {
      display: 'none'
    }
  },
  '.bp-md': {
    display: 'none',
    '@md': {
      display: 'block'
    },
    '@lg': {
      display: 'none'
    }
  },
  '.bp-lg': {
    display: 'none',
    '@lg': {
      display: 'block'
    },
    '@xl': {
      display: 'none'
    }
  },
  '.bp-xl': {
    display: 'none',
    '@xl': {
      display: 'block'
    },
    '@xxl': {
      display: 'none'
    }
  },
  '.bp-xxl': {
    display: 'none',
    '@xxl': {
      display: 'block'
    }
  }
})
</style>
