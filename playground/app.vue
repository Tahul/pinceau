<template>
  <NuxtLayout>
    <section>
      <Block primary />
      <Block black />
      <Block lila />
      <Block lavender />
      <Block velvet />
      <Block grape />
    </section>
  </NuxtLayout>
</template>

<style lang="ts">
css({
  section: {
    flex: '1',
    width: '100%',
    overflowY: 'auto',
    padding: '1rem 2rem',
    zIndex: '50',
    '& > * + *': {
      marginTop: '1rem'
    }
  }
})
</style>
