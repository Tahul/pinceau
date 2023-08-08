<script setup lang="ts">

</script>

<template>
  <div class="vue-runtime">
    Hello Vue Runtime
  </div>
</template>

<style lang="ts">
css({
  '.vue-runtime': {
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
