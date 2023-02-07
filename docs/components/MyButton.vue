<script setup lang="ts">
import type { PropType } from 'vue'
import type { PinceauTheme } from 'pinceau'
import { computedStyle, cssProp } from 'pinceau/runtime'
import type { NuxtLinkProps } from '#app'

defineProps({
  to: {
    type: String as PropType<NuxtLinkProps['to']>,
    required: false,
  },
  color: computedStyle<keyof PinceauTheme['color']>('red'),
  ...variants,
  css: cssProp,
})
</script>

<template>
  <NuxtLink :to="to">
    <button class="my-button">
      <span v-if="!$slots?.default">Hello Amsterdam 👋</span>
      <span v-else><ContentSlot :use="$slots.default" unwrap="p" /></span>
    </button>
  </NuxtLink>
</template>

<style scoped lang="ts">
css({
    '.my-button': {
        '--button-primary': (props) => `{color.${props.color}.600}`,
        '--button-secondary': (props) => `{color.${props.color}.500}`,
        '--button-accent': (props) => `{color.${props.color}.300}`,
        display: 'inline-block',
        borderRadius: '{radii.xl}',
        transition: 'box-shadow .1 ease-in-out',
        color: '{color.white}',
        boxShadow: `0 5px 0 {button.primary}, 0 12px 16px rgba(0, 0, 0, .35)`,
        span: {
            display: 'inline-block',
            fontFamily: '{font.secondary}',
            borderRadius: '{radii.lg}',
            fontSize: '{fontSize.xl}',
            lineHeight: '{lead.none}',
            transition: '{transition.all}',
            backgroundColor: '{button.primary}',
            boxShadow: 'inset 0 -1px 1px rgba(255, 255, 255, .15)',
        },
        '&:hover': {
            span: {
                backgroundColor: `{button.secondary}`,
            }
        },
        '&:active': {
            span: {
                transform: 'translateY(4px)'
            }
        }
    },
    variants: {
        size: {
            sm: {
                span: {
                    padding: '{space.6} {space.12}'
                },
            },
            md: {
                span: {
                    padding: '{space.12} {space.16}'
                },
            },
            lg: {
                span: {
                    padding: '{space.16} {space.24}'
                },
            },
            xl: {
                span: {
                    padding: '{space.32} {space.48}'
                },
            },
            options: {
                default: 'sm',
            },
        },
    },
})
</style>
