<script setup lang="ts">
import Repl from '../src/components/Repl.vue'
</script>

<template>
  <Repl
    theme="dark"
    :ssr="false"
  />
</template>

<style lang="ts">
css({
  '.repl-root': {
    height: '100%',
    fontFamily: '$font.mono',
  },
})
</style>
