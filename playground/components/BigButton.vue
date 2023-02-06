<script setup lang="ts">
import type { PinceauTheme } from 'pinceau'
import { computedStyle } from 'pinceau/runtime'

defineProps({
  color: computedStyle<keyof PinceauTheme['color']>('red'),
  ...variants,
})
</script>

<template>
  <button class="big-button">
    <span v-if="!$slots.default">Hello Amsterdam 👋</span>
    <span v-else><slot /></span>
    <slot />
  </button>
</template>

<style scoped lang="ts">
css({
    '.big-button': {
        '--button-primary': (props) => `{color.${props.color}.600}`,
        '--button-secondary': (props) => `{color.${props.color}.500}`,
        '--button-accent': (props) => `{color.${props.color}.300}`,
        '--button-accent-lighter': (props) => `{color.${props.color}.200}`,
        display: 'inline-block {color.black}',
        borderRadius: '{radii.xl}',
        transition: 'box-shadow .1 ease-in-out',
        color: '{color.white}',
        boxShadow: `0 8px 0 var(--button-primary), 0 12px 16px rgba(0, 0, 0, .35)`,
        span: {
            fontFamily: '{font.secondary}',
            display: 'inline-block',
            borderRadius: '{radii.lg}',
            // fontSize: '{fontSize.xl}',
            lineHeight: '1',
            transition: 'background-color .2s ease-in-out, transform .1s ease-in-out, text-shadow .1s ease-in-out, box-shadow .1s ease-in-out',
            boxShadow: 'inset 0 -1px 1px rgba(255, 255, 255, .15)',
            backgroundColor: 'var(--button-primary)',
            backgroundImage: `linear-gradient(rgba(var(--button-secondary), .8), rgba(var(--button-primary), .2))`,
            textShadow: `0 -1px 1px rgba(var(--button-accent-lighter), .7)`,
        },
        '&:hover': {
            span: {
                backgroundColor: `var(--button-secondary)`,
                textShadow: `0 -1px 1px rgba(var(--button-accent), .9), 0 0 5px rgba(255, 255, 255, .8)`
            }
        },
        '&:active': {
            boxShadow: `0 8px 0 var(--button-secondary), 0 12px 10px rgba(0, 0, 0, .3)`,
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
                default: 'xl',
            },
        },
    },
})
</style>
