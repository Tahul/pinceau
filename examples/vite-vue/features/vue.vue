<script lang="ts">
const testSecond = 'hello world?'
</script>

<script setup lang="ts">
const props = defineProps<{
  backgroundColor?: string
  color?: string
}>()

const backgroundColor = $theme('color.blue.100')
</script>

<template>
  <div :style="{ backgroundColor }" class="test">
    Hello Vue
  </div>
</template>
