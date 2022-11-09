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
    zIndex: '{zIndices.0}',

    border: '4px solid {colors.gray.100}',
    '@dark': {
      border: '4px solid {colors.gray.900}',
    }
  }
})
</style>
