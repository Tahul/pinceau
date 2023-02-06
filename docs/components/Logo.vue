<template>
  <div>
    <MovingHead location="logo" />

    <p>Pinceau</p>
  </div>
</template>

<style scoped lang="ts">
css({
  div: {
    maxHeight: '{docus.header.height}',
    display: 'flex',
    alignItems: 'center',
    p: {
      marginLeft: '{space.2}',
      fontFamily: '{typography.font.display}'
    }
  }
})
</style>
