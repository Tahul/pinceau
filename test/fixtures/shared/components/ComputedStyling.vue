<script setup lang="ts">
const props = defineProps({
  color: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div>
    🔥
  </div>
</template>

<style scoped lang="ts">
css({
  div: {
    backgroundColor: (props) => props.color
  }
})
</style>
