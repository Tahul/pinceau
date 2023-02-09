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
            <span v-else>
                <ContentSlot :use="$slots.default" unwrap="p" />
            </span>
        </button>
    </NuxtLink>
</template>

<style scoped lang="ts">
css({
    '.my-button': {
        '--button-primary': (props) => `{color.${props.color}.600}`,
        '--button-secondary': (props) => `{color.${props.color}.500}`,
        display: 'inline-block',
        borderRadius: '{radii.xl}',
        transition: '{transition.all}',
        color: '{color.white}',
        boxShadow: `0 5px 0 {button.primary}, 0 12px 16px {color.dimmed}`,
        span: {
            display: 'inline-block',
            fontFamily: '{typography.font.display}',
            borderRadius: '{radii.lg}',
            fontSize: '{fontSize.xl}',
            lineHeight: '{lead.none}',
            transition: '{transition.all}',
            backgroundColor: '{button.primary}',
            boxShadow: 'inset 0 -1px 1px {color.dark}',
        },
        '&:hover': {
            span: {
                backgroundColor: `{button.secondary}`,
            }
        },
        '&:active': {
            span: {
                transform: 'translateY({space.1})'
            }
        }
    },
    variants: {
        size: {
            sm: {
                span: {
                    padding: '{space.3} {space.6}',
                },
            },
            md: {
                span: {
                    padding: '{space.6} {space.8}'
                },
            },
            lg: {
                span: {
                    padding: '{space.8} {space.12}'
                },
            },
            xl: {
                span: {
                    padding: '{space.12} {space.24}'
                },
            },
            options: {
                default: 'sm',
            },
        },
    },
})
</style>
