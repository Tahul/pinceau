<script setup lang="ts">
import { theme } from '#pinceau/theme/flat'

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
    '@mq.md': {
      display: 'none'
    }
  },
  '.bp-md': {
    display: 'none',
    '@mq.md': {
      display: 'block'
    },
    '@mq.lg': {
      display: 'none'
    }
  },
  '.bp-lg': {
    display: 'none',
    '@mq.lg': {
      display: 'block'
    },
    '@mq.xl': {
      display: 'none'
    }
  },
  '.bp-xl': {
    display: 'none',
    '@mq.xl': {
      display: 'block'
    },
    '@mq.xxl': {
      display: 'none'
    }
  },
  '.bp-xxl': {
    display: 'none',
    '@mq.xxl': {
      display: 'block'
    }
  }
})
</style>
