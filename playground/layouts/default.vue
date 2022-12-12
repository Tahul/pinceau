<script setup lang="ts">
import BreakpointDisplay from '../components/BreakpointDisplay.vue'
import ThemeSelect from '../components/ThemeSelect.vue'
</script>

<template>
  <div
    class="layout"
  >
    <header>
      <span>
        🖌&nbsp;Pinceau playground
      </span>

      <div>
        <ThemeSelect />
        <BreakpointDisplay />
      </div>
    </header>

    <slot />

    <footer>
      <span>
        🖌&nbsp;
      </span>

      <div>
        <ThemeSelect />
        <BreakpointDisplay />
      </div>
    </footer>
  </div>
</template>

<style lang="ts">
css({
  'body': {
    backgroundColor: '{color.white}',
    footer: {
      color: 'blue !important',
      '@dark': {
        color: 'red !important'
      }
    },
    '@dark': {
      backgroundColor: '{color.black}',
    },
  }
})
</style>

<style lang="postcss">
html, body {
  font-family: $dt('font.secondary');

  color: $dt('color.black');
  /* background-color: $dt('color.white'); */

  @dark {
    color: $dt('color.white');
    /* background-color: $dt('color.black'); */
  }
}

html, body, #app, #__nuxt {
  display: flex;
  min-height: 100vh;
  width: 100vw;
}
</style>

<style lang="postcss">
.layout {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow-y: auto;
  margin: 0;
  padding: 0;

  header,
  footer {
    background-color: $dt('color.black');
    color: $dt('color.white');
    flex: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 50;

    span {
      font-weight: bold;
    }
    div {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 1em;
    }
  }

  section {
    flex: 1;
    height: 100%;
    width: 100%;
    padding: 2rem;
    z-index: 50;
  }
}
</style>

