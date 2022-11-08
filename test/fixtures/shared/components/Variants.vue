<script setup lang="ts">
defineProps({
  ...variants,
})
</script>

<template>
  <div />
</template>

<style lang="ts">
css({
  variants: {
    shadow: {
      small: {
        boxShadow: '{shadows.sm}'
      },
      large: {
        boxShadow: '{shadows.lg}'
      },
      giant: {
        boxShadow: '{shadows.xxl}'
      }
    }
  }
})
</style>
