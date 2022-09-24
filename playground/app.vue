<template>
  <NuxtLayout>
    <section>
      <Block color="{colors.primary.600}" />
      <Block color="black" />
      <Block color="lila" />
      <Block color="lavender" />
      <Block color="velvet" />
      <Block color="grape" />
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
    '& > button + *': {
      marginTop: '1rem'
    }
  }
})
</style>
