<template>
  <main class="main">
    <Navigation />

    <RouterView />
  </main>
</template>


<style lang="ts">
css({
  'html, body, #app': {
    height: '100vh',
    width: '100vw',
    backgroundColor: '$color.blue.2'
  },
})
</style>

<style scoped lang="ts">
css({
  '.main': {
    width: '100%',
    height: '100%',
    padding: '$space.8',
  }
})
</style>
