<script setup lang="ts">
defineProps({
  ...$variantsProps,
})
</script>

<template>
  <div :class="$pinceau">
    <slot />
  </div>
</template>

<style scoped lang="ts">
css({
  div: {
    borderRadius: '{radii.lg}',
    borderWidth: '{borderWidths.md}',
  },
  variants: {
    size: {
      sm: {
        padding: '{space.6}',
        fontSize: '{fontSizes.sm}'
      },
      md: {
        padding: '{space.8}',
        fontSize: '{fontSizes.md}'
      },
      lg: {
        padding: '{space.12}',
        fontSize: '{fontSizes.lg}'
      },
      xl: {
        padding: '{space.16}',
        fontSize: '{fontSizes.xl}'
      },
      options: {
        default: 'lg'
      }
    },
    primary: {
      true: {
        backgroundColor: 'rgba({colors.blue.500}, 0.5)',
        color: '{colors.blue.200}',
        borderColor: '{colors.blue.300}'
      }
    },
    success: {
      true: {
        backgroundColor: 'rgba({colors.green.500}, 0.5)',
        color: '{colors.green.200}',
        borderColor: '{colors.green.300}'
      }
    },
    warning: {
      true: {
        backgroundColor: 'rgba({colors.yellow.500}, 0.5)',
        color: '{colors.yellow.200}',
        borderColor: '{colors.yellow.300}'
      }
    },
    danger: {
      true: {
        backgroundColor: 'rgba({colors.red.500}, 0.5)',
        color: '{colors.red.200}',
        borderColor: '{colors.red.300}'
      }
    }
  }
})
</style>
