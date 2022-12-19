<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  color: {
    type: [String, Object] as PropType<any>,
  },
  ...variants,
})
</script>

<template>
  <div class="alert">
    <slot />
  </div>
</template>

<style scoped lang="ts">
css({
  '.alert': {
    display: 'block',
    borderRadius: '{radii.lg}',
    borderWidth: '{borderWidth.md}',
  },
  variants: {
    size: {
      sm: {
        padding: '{space.6}',
        fontSize: '{fontSize.sm}'
      },
      md: {
        padding: '{space.8}',
        fontSize: '{fontSize.md}'
      },
      lg: {
        padding: '{space.12}',
        fontSize: '{fontSize.lg}'
      },
      xl: {
        padding: '{space.16}',
        fontSize: '{fontSize.xl}'
      },
      options: {
        default: 'xl'
      }
    },
    primary: {
      true: {
        backgroundColor: '{color.blue.500}',
        color: '{color.blue.200}',
        borderColor: '{color.blue.300}'
      },
      options: {
        default: true
      }
    },
    success: {
      true: {
        backgroundColor: '{color.green.500}',
        color: '{color.green.200}',
        borderColor: '{color.green.300}'
      }
    },
    warning: {
      true: {
        backgroundColor: '{color.yellow.500}',
        color: '{color.yellow.200}',
        borderColor: '{color.yellow.300}'
      }
    },
    danger: {
      true: {
        backgroundColor: '{color.red.500}',
        color: '{color.red.200}',
        borderColor: '{color.red.300}'
      }
    }
  }
})
</style>
