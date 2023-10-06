<script setup lang="ts">
console.log('hello world')
</script>

<script lang="ts">
export const test = 'hello world'
</script>

<template>
  <div class="test-style">
    css() style component
  </div>
</template>

<style lang="ts">
css({
  '.test-style': {
    fontSize: 32,
  },
})
</style>
