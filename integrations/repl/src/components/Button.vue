<template>
  <button>
    <slot name="icon" />
    <slot />
  </button>
</template>

<style lang="ts">
styled({
  backgroundColor: '$color.gray.9',
  padding: '$space.2',
  color: '$color.gray.6',
})
</style>
