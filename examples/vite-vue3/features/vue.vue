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
    backgroundColor: props => props.backgroundColor,
    color: props => props.color,
    padding: '26px',
  },
  'variants': {
    size: {
      sm: {
        padding: 1,
        margin: 1,
      },
      md: {
        padding: 3,
        margin: 3,
      },
      lg: {
        padding: 5,
        margin: 5,
      },
      xl: {
        padding: 7,
        margin: 7,
      },
    },
  },
})
</style>
