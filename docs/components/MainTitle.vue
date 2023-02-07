<script lang="ts" setup>

</script>

<template>
  <section class="main-hero">
    <div class="main-title">
      <h1>
        <p>Make your <code><span>&lt;</span><span>script</span><span>&gt;</span></code> lighter</p>
        <p>and your <code><span>&lt;</span><span>style</span><span>&gt;</span></code> smarter</p>
      </h1>

      <Illustration />
    </div>

    <div class="main-cta">
      <ContentSlot :use="$slots.default" unwrap="p" />
    </div>
  </section>
</template>

<style scoped lang="ts">
css({
  '.main-hero': {
    marginTop: '{space.16}',
    display: 'flex',
    flexDirection: 'column',
    gap: '{space.16}'
  },

  '.main-cta': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '{space.4}'
  },

  '.main-title': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column-reverse',
    gap: '{space.8}',
    '@lg': {
      flexDirection: 'row',
      gap: '{space.24}',
    },

    ':deep(svg)': {
      minWidth: '200px',
    },

    h1: {
      fontFamily: '{typography.font.display}',
      fontSize: '{fontSize.4xl}',
      textAlign: 'center',

      '@md': {
        fontSize: '{fontSize.5xl}',
      }
    },

    code: {
      fontFamily: '{typography.font.display}',
      padding: 0,
      fontSize: '{fontSize.4xl}',
      backgroundColor: 'transparent !important',
      color: 'inherit',

      '@md': {
        fontSize: '{fontSize.5xl}',
      },

      pre: {
        backgroundColor: 'transparent !important',
      },

      span: {
        '&:first-child, &:span:last-child': {
          color: '{color.primary.100} !important',
        },
        '&:nth-child(2)': {
          color: '{color.primary.500} !important',
        }
      },
    }
  }
})
</style>
