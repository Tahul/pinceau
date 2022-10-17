<script setup>
</script>

<template>
  <div>
    <slot />
  </div>
</template>

<style lang="ts" scoped>
css({
  div: {
    width: '100%',
    height: '100%',
    border: '1px solid {colors.gray.900}',
    borderRadius: '{radii.xl}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '{zIndices.0}'
  }
})
</style>
