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
    padding: '{space.32}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '{space.24}',
    zIndex: '{zIndex.0}',
    border: '4px solid {color.grey.100}',
    '@dark': {
      border: '4px solid {color.grey.900}',
    }
  }
})
</style>
