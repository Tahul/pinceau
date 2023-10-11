<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    color?: keyof PinceauTheme['color']
  }>(),
  {
    color: 'green',
  },
)
</script>

<template>
  <button>
    <span v-if="!$slots?.default">
      Hello Pinceau 1.0
    </span>
    <span v-else>
      <slot />
    </span>
  </button>
</template>

<style lang="ts">
styled({
  '$button.bg': () => `$color.${props.color}.5`,
  '$button.border': () => `$color.${props.color}.6`,
  '$button.active': () => `$color.${props.color}.4`,
  'color': '$color.white',
  'transition': 'all 333ms ease-out',
  'display': 'inline-block',
  'borderRadius': '$radii.xs',
  'backgroundColor': '$button.bg',
  'span': {
    boxShadow: 'inset 0 0 0 2px $button.border, 0 1px 2px $color.black',
    display: 'inline-block',
    fontFamily: '$',
    borderRadius: '$radii.sm',
    fontSize: '$fontSize.xl',
    lineHeight: '0',
  },
  '&:hover': {
    span: {
      backgroundColor: '$button.border',
    },
  },
  '&:active': {
    span: {
      boxShadow: 'inset 0 0 0 2px $button.active',
    },
  },
  'variants': {
    size: {
      sm: {
        span: {
          padding: '$space.3 $space.6',
        },
      },
      md: {
        span: {
          padding: '$space.4 $space.8',
        },
      },
      lg: {
        span: {
          padding: '$space.6 $space.12',
        },
      },
      xl: {
        span: {
          padding: '$space.8 $space.16',
        },
      },
      options: {
        default: 'md',
      },
    },
  },
})
</style>
