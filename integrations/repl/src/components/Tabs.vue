<script lang="ts" setup>
interface Tab {
  value: string
  label: string
}

withDefaults(
  defineProps<{
    modelValue: string
    tabs: Tab[]
  }>(),
  {
    tabs: () => ([]),
  },
)

const emit = defineEmits(['update:modelValue'])

const setValue = (value: string) => emit('update:modelValue', value)
</script>

<template>
  <div>
    <button
      v-for="tab of tabs"
      :key="tab.value"
      :class="{ active: modelValue === tab.value }"
      @click="() => setValue(tab.value)"
    >
      <span>{{ tab.label }}</span>
    </button>
  </div>
</template>

<style scoped lang="ts">
styled({
  'height': 'var(--tabs-height)',
  'borderBottom': '1px solid var(--border)',
  'boxSizing': 'border-box',
  'backgroundColor': 'var(--bg)',
  'overflow': 'hidden',
  'display': 'flex',
  'justifyContent': 'space-evenly',
  'overflowY': 'hidden',
  'overflowX': 'auto',
  '&::-webkit-scrollbar': {
    height: '1px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'var(--border)',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'var(--color-branding)',
  },
  'button': {
    'position': 'relative',
    'fontFamily': '\'Onest\'',
    'flex': '1',
    'display': 'inline-flex',
    'alignItems': 'center',
    'justifyContent': 'center',
    'fontSize': '12px',
    'cursor': 'pointer',
    'color': 'var(--text-light)',
    'boxSizing': 'border-box',
    'padding': '$space.1',
    'transition': 'all 0.5s ease-in-out',

    '&::after': {
      content: '\'\'',
      opacity: 0,
    },

    '&.active': {
      'color': 'var(--color-branding-dark)',
      'fontWeight': '$fontWeight.bold',

      '&::before': {
        content: '\'\'',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '3px',
        backgroundImage: 'linear-gradient(270deg, $color.white 0%, $color.red.5 100%)',
      },

      '&::after': {
        opacity: 1,
        content: '\'\'',
        position: 'absolute',
        backgroundSize: '100%',
        backgroundImage: 'linear-gradient(270deg, rgba(239, 88, 63, 0.05) 0%, rgba(255,255,255,0.05) 100%)',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
      },
    },
  },
  'span': {
    fontSize: '13px',
    fontFamily: 'var(--font-code)',
    textTransform: 'uppercase',
    color: 'var(--text-light)',
    display: 'inline-block',
    padding: '8px 16px 6px',
    lineHeight: '20px',
  },
})
</style>
