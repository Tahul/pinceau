<template>
  <div class="test-base">Basic Vue component</div>
</template>

<script setup lang="ts">
console.log('hello world')
</script>

<script lang="ts">
export const test = 'hello world'
</script>

<style>
.test-base {
  font-size: 16px;
}
</style>
