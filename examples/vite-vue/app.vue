<template>
  <main>
    <Navigation />

    <RouterView />
  </main>
</template>

<style scoped lang="ts">
css({
  main: {
    padding: '{space.16}',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  }
})
</style>
