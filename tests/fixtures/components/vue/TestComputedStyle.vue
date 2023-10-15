<script setup lang="ts">
const props = defineProps({
  fontSize: {
    type: Number,
    required: false,
    default: 16,
  },
  backgroundColor: {
    type: String,
    required: false,
    default: 'white',
  },
})
</script>

<script lang="ts">
export const test = 'hello world'
</script>

<template>
  <div
    class="test-computed-style"
    :styled="{
      fontSize: () => props.fontSize + 2,
    }"
  >
    Computed Style component
  </div>
</template>

<style lang="ts">
css({
  '.test-computed-style': {
    fontSize: () => props.fontSize,
    backgroundColor: () => props.backgroundColor,
  },
})
</style>
