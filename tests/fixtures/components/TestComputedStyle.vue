<template>
  <div class="test-computed-style">Computed Style component</div>
</template>

<script setup lang="ts">
const props = defineProps({
  fontSize: {
    type: Number,
    required: false,
    default: 16
  },
  backgroundColor: {
    type: String,
    required: false,
    default: 'white'
  }
})
</script>

<script lang="ts">
export const test = 'hello world'
</script>

<style lang="ts">
css({
  '.test-computed-style': {
    fontSize: () => props.fontSize,
    backgroundColor: () => props.backgroundColor
  }
})
</style>
