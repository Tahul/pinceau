<template>
  <div
    class="layout"
  >
    <header>
      <span>
        @nuxtjs/design-tokens
      </span>
    </header>

    <slot />

    <footer>
      <span>
        {{ 'Footer' }}
      </span>

      <span>Built with @nuxtjs/design-tokens</span>
    </footer>
  </div>
</template>

<style lang="postcss">
html, body {
  max-height: 100vh;
  max-width: 100vw;
  font-family: $dt('fonts.primary');
}
</style>

<style scoped lang="postcss">
.layout {
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow-y: auto;
  background-color: $dt('colors.primary.500');
  color: white;
  margin: 0;
  padding: 0;

  @dark {
    background-color: $dt('colors.primary.200');
  }

  @screen lg {
    background-color: $dt('colors.primary.900');
  }

  header {
    display: flex;
    align-items: center;
    padding: 1rem 2rem;
    position: sticky;
    top: 0;
    width: 100%;
    background-color: $dt('colors.primary.500');
    z-index: 50;
    span {
      font-weight: bold;
    }
  }

  footer {
    background-color: $dt('colors.grape');
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    position: sticky;
    top: 0;
    width: 100%;
    background-color: $dt('colors.black');
    z-index: 50;
    span {
      font-weight: bold;
    }
  }
}
</style>

