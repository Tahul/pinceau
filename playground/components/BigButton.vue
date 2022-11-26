<script setup lang="ts">
import { computedStyle } from 'pinceau/runtime'

defineProps({
  color: computedStyle('color', 'pink'),
  ...variants,
})

const test = () => { }

test()
</script>

<template>
  <button class="big-button">
    <span>Hello Nuxt Nation 👋</span>
  </button>
</template>

<style scoped lang="ts">
css({
    variants: {
        padded: {
            sm: {
                span: {
                    padding: '{space.4} {space.8}',
                }
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
                default: 'md'
            }
        }
    },
    '.big-button': {
        display: 'inline-block',
        borderRadius: '{radii.lg}',
        transition: 'box-shadow .1 ease-in-out',
        color: '{colors.white}',
        boxShadow: (props) => `0 8px 0 {colors.${props.color}.600}, 0 12px 16px rgba(0, 0, 0, .35)`,
        span: {
            fontFamily: '{fonts.secondary}',
            display: 'inline-block',
            borderRadius: '{radii.lg}',
            fontSize: '{fontSizes.xl}',
            lineHeight: '1',
            transition: 'background-color .2s ease-in-out, transform .1s ease-in-out, text-shadow .1s ease-in-out, box-shadow .1s ease-in-out',
            boxShadow: 'inset 0 -1px 1px rgba(255, 255, 255, .15)',
            backgroundColor: (props) => `{colors.${props.color}.500}`,
            backgroundImage: (props) => `linear-gradient(rgba({colors.${props.color}.500}, .8), rgba({colors.${props.color}.600}, .2))`,
            textShadow: (props) => `0 -1px 1px rgba({colors.${props.color}.200}, .7)`,
        },
        '&:hover': {
            span: {
                backgroundColor: (props) => `{colors.${props.color}.500}`,
                textShadow: (props) => `0 -1px 1px rgba({colors.${props.color}.300}, .9), 0 0 5px rgba(255, 255, 255, .8)`
            }
        },
        '&:active': {
            boxShadow: (props) => `0 8px 0 {colors.${props.color}.500}, 0 12px 10px rgba(0, 0, 0, .3)`,
            span: {
                transform: 'translate(0, 4px)'
            }
        }
    }
})
</style>
