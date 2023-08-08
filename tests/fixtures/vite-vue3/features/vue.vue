<script lang="ts">
const testSecond = 'hello world?'
</script>

<script setup lang="ts">
const props = defineProps<{
  backgroundColor?: string
  color?: string
}>()

const backgroundColor = $dt('color.primary')
</script>

<template>
  <div :style="{ backgroundColor }" class="test">
    Hello Vue
  </div>
</template>

<style lang="ts">
css({
  '.test': {
    padding: '26px',
  },
})
</style>
