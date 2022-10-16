<script setup lang="ts">
import BreakpointDisplay from '../components/BreakpointDisplay.vue'
</script>

<template>
  <div
    class="layout"
  >
    <header>
      <span>
        🖌&nbsp;Pinceau
      </span>

      <BreakpointDisplay />
    </header>

    <slot />

    <footer>
      <span>
        🖌&nbsp;Pinceau
      </span>

      <BreakpointDisplay />
    </footer>
  </div>
</template>

<style lang="postcss">
html, body, #app, #__nuxt {
  display: flex;
  min-height: 100vh;
  width: 100vw;

  font-family: $dt('fonts.primary') !important;

  @light {
    color: black;
    background-color: red;
  }

  @dark {
    color: white;
    background-color: black;
  }
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
  color: white;
  margin: 0;
  padding: 0;

  header {
    flex: 0;
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

  section {
    flex: 1;
    height: 100%;
    width: 100%;
    padding: 2rem;
    z-index: 50;
  }

  footer {
    flex: 0;
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

