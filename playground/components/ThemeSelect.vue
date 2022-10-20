<script setup lang="ts">
import { useColorMode } from '#imports'

const colorMode = useColorMode()

const toggle = () => {
  const values = ['light', 'dark']
  const index = values.indexOf(colorMode.preference)
  const next = (index + 1) % values.length
  colorMode.preference = values[next]
}
</script>

<template>
  <button aria-label="Select color scheme" @click="toggle">
    <ColorScheme placeholder="...">
      <span v-if="colorMode.preference === 'dark'">🌚</span>
      <span v-else>☀️</span>
    </ColorScheme>
  </button>
</template>
