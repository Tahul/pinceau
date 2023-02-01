<script setup lang="ts">
import { usePinceauTheme } from 'pinceau/runtime'

const theme = usePinceauTheme()

const mediaQueries = Object.entries(theme.theme.value?.media).reduce(
  (acc, [key, value]) => {
    return { ...acc, [key.replace('media.', '')]: value }
  },
  {},
)
</script>

<template>
  <ClientOnly>
    <div>
      <span v-for="[key] of Object.entries(mediaQueries)" :key="key" :class="`bp-${key}`">
        {{ key }}
      </span>
    </div>
  </ClientOnly>
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
