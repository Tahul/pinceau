<script setup lang="ts">
const props = defineProps({
  ...$variantsProps,
})
</script>

<template>
  <div :class="$variantsClass" />
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
        boxShadow: '{shadows.2xl}'
      }
    }
  }
})
</style>
