<template>
  <div class="test-style">css() style component</div>
</template>

<script setup lang="ts">
console.log('hello world')
</script>

<script lang="ts">
export const test = 'hello world'
</script>

<style lang="ts">
css({
  '.test-style': {
    fontSize: 32
  }
})
</style>
