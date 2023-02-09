<template>
  <button class="demo-button">
    <span>
      <slot />
    </span>
  </button>
</template>

<style scoped lang="ts">
css({
  '.demo-button': {
    display: 'inline-block',
    borderRadius: '{radii.xl}',
    transition: '{transition.all}',
    color: '{color.white}',
    boxShadow: `0 5px 0 {color.primary.600}, 0 12px 16px {color.dimmed}`,
    span: {
      display: 'inline-block',
      fontFamily: '{font.secondary}',
      borderRadius: '{radii.lg}',
      fontSize: '{fontSize.xl}',
      lineHeight: '{lead.none}',
      transition: '{transition.all}',
      backgroundColor: '{color.primary.600}',
      boxShadow: 'inset 0 -1px 1px {color.dark}',
      padding: '{space.6} {space.12}'
    },
    '&:hover': {
      span: {
        backgroundColor: `{color.primary.500}`,
      }
    },
    '&:active': {
      span: {
        transform: 'translateY({space.4})'
      }
    }
  }
})
</style>
