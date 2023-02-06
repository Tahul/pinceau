<script setup lang="ts">
import BreakpointDisplay from '../components/BreakpointDisplay.vue'
import ThemeSelect from '../components/ThemeSelect.vue'
</script>

<template>
  <div class="layout">
    <img src="/background.jpg">
    <header>
      <RouterLink to="/">
        <span>
          🖌&nbsp;Pinceau playground
        </span>
      </RouterLink>

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

<style lang="postcss">
html,
body {
  font-family: $dt('font.secondary');

  color: $dt('color.grey.100');
  background-color: $dt('color.white');

  @dark {
    color: $dt('color.white');
    background-color: $dt('color.grey.800');
  }
}

html,
body,
#app,
#__nuxt {
  display: flex;
  min-height: 100vh;
  width: 100vw;
}
</style>

<style lang="postcss">
.layout {
  position: relative;
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
    flex: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 50;
    background-color: $dt('color.grey.600');
    color: $dt('color.white');

    @dark {
      background-color: $dt('color.grey.900');
    }

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
    z-index: 50;
  }

  img {
    z-index: 0;
    filter: blur(12px);
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    user-select: none;
  }
}
</style>
