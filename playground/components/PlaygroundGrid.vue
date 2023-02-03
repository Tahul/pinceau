<template>
  <div>
    <slot />
  </div>
</template>

<style lang="ts" scoped>
css({
  div: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    borderRadius: '{radii.xxl}',
    padding: '{space.32}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '{space.24}',
    zIndex: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    border: '2px solid {color.grey.100}',
    '@dark': {
      border: '2px solid {color.grey.900}',
    }
  }
})
</style>
