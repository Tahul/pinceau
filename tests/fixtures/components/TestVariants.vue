<template>
  <div class="test-variants">Variants component</div>
</template>

<script setup lang="ts">
defineProps({
  fontSize: {
    type: Number,
    required: false,
    default: 16
  }
})
</script>

<script lang="ts">
export const test = 'hello world'
</script>

<style lang="ts">
css({
  '.test-computed-style': {
    fontSize: props => props.fontSize
  }
})
</style>
