<script setup lang="ts">
defineProps({
  color: {
    type: String,
    default: 'red',
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
