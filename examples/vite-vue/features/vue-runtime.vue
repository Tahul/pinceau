<template>
  <div :styled="{ backgroundColor: '$color.blue.5' }" :class="['vue-runtime']">
    Hello Vue Runtime
  </div>
</template>

<style lang="ts">
css({
  variants: {
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
  }
})
</style>
