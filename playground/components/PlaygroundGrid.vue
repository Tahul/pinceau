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
    borderRadius: '{radii.xl}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '{zIndex.0}',
    border: '4px solid {color.gray.100}',
    '@dark': {
      border: '4px solid {color.gray.900}',
    }
  }
})
</style>
