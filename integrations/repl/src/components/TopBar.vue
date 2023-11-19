<script lang="ts" setup>
import Logo from './Logo.vue'
import FrameworkSelect from './editor/FrameworkSelect.vue'
import LayoutToggle from './editor/LayoutToggle.vue'
import ConfigToggle from './editor/ConfigToggle.vue'
</script>

<template>
  <div>
    <div>
      <span class="logo">
        <Logo />
        <i>/</i>
        <span>PLAYGROUND</span>
      </span>
    </div>

    <div class="actions">
      <ConfigToggle />
      <LayoutToggle />
      <span class="separator" />
      <FrameworkSelect />
      <!--
      <PinceauSelect />
      <TypescriptSelect />
      <span class="separator" />
      -->
    </div>
  </div>
</template>

<style scoped lang="ts">
styled({
  'padding': '$space.4',
  'gap': '$space.1',
  'display': 'flex',
  'alignItems': 'center',
  'flexDirection': 'column',
  'backgroundColor': '$color.gray.9',
  'borderBottom': '1px solid $color.gray.8',
  'height': 'calc(var(--header-height) * 2)',
  'justifyContent': 'space-between',

  '$md': {
    flexDirection: 'row',
    height: 'var(--header-height)',
  },

  '.logo': {
    'display': 'flex',
    'alignItems': 'center',
    'gap': '$space.1',
    'fontWeight': '$fontWeight.bold',

    'i': {
      color: '$color.white',
      padding: '0 $space.1',
    },

    '& > span': {
      'color': 'transparent',
      'background': 'linear-gradient(127deg, $color.red.4, #FEC8C200), linear-gradient(-127deg, $color.red.2, #FEC8C200)',
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',
    },
  },

  '.actions': {
    'display': 'flex',
    'alignItems': 'center',
    'gap': '0.5rem',

    '& > div': {
      display: 'flex',
      alignItems: 'center',
      gap: '$space.2',
    },
  },

  '.separator': {
    width: '2px',
    backgroundColor: '$color.gray.8',
    height: '$space.6',
    display: 'block',
  },
})
</style>
