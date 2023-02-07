<script setup lang="ts">
import type { PinceauTheme } from 'pinceau'
import { computedStyle, cssProp } from 'pinceau/runtime'

defineProps({
  color: computedStyle<keyof PinceauTheme['color']>('red'),
  ...variants,
  css: cssProp,
})
</script>

<template>
  <button class="my-button">
    <span v-if="!$slots?.default">Hello Amsterdam 👋</span>
    <span v-else><ContentSlot unwrap="p" :use="$slots.default" /></span>
  </button>
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
        boxShadow: `0 8px 0 {button.primary}, 0 12px 16px rgba(0, 0, 0, .35)`,
        span: {
            fontFamily: '{font.primary}',
            borderRadius: '{radii.lg}',
            fontSize: '{fontSize.xl}',
            lineHeight: '1',
            transition: 'all .1s ease-in-out',
            boxShadow: 'inset 0 -1px 1px rgba(255, 255, 255, .15)',
            backgroundColor: '{button.primary}',
            backgroundImage: `linear-gradient({button.secondary}, .8), rgba({button.primary}, .2))`,
            '&:hover': {
                backgroundColor: `var(--button-secondary)`,
                textShadow: `0 -1px 1px rgba({button.accent}, .9), 0 0 5px rgba(255, 255, 255, .8)`
            },
        },
        '&:active': {
            boxShadow: `0 8px 0 {button.secondary}, 0 12px 10px rgba(0, 0, 0, .3)`,
            span: {
                transform: 'translate(0, 4px)'
            }
        }
    },

    variants: {
        padded: {
            sm: {
                span: {
                    padding: '{space.4} {space.8}',
                },
            },
            md: {
                span: {
                    padding: '{space.8} {space.16}',
                }
            },
            lg: {
                span: {
                    padding: '{space.16} {space.32}',
                }
            },
            xl: {
                span: {
                    padding: '{space.32} {space.64}',
                }
            },
            options: {
                default: 'sm',
            },
        },
    },
})
</style>
