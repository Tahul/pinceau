<script setup lang="ts">
defineProps({
  fontSize: {
    type: Number,
    required: false,
    default: 16,
  },
})
</script>

<script lang="ts">
export const test = 'hello world'
</script>

<template>
  <div class="test-variants">
    Variants component
  </div>
</template>

<style lang="ts">
css({
  '.test-variants': {
    color: '$color.black',
  },
  'variants': {
    size: {
      sm: {
        padding: '$space.3 $space.6',
      },
      md: {
        padding: '$space.6 $space.8',
      },
      lg: {
        padding: '$space.8 $space.12',
      },
      xl: {
        padding: '$space.12 $space.2',
      },
      options: {
        default: 'sm',
      },
    },
    color: {
      blue: {
        color: '$color.blue.5',
        backgroundColor: '$color.blue.1',
        borderColor: '$color.blue.9',
      },
      red: {
        color: '$color.red.5',
        backgroundColor: '$color.red.1',
        borderColor: '$color.red.9',
      },
      violet: {
        color: '$color.violet.5',
        backgroundColor: '$color.violet.1',
        borderColor: '$color.violet.9',
      },
      green: {
        color: '$color.green.5',
        backgroundColor: '$color.green.1',
        borderColor: '$color.green.9',
      },
      options: {
        default: 'blue',
      },
    },
  },
})
</style>
