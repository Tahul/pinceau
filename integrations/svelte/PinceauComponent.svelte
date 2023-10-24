<script>
  import { usePinceauRuntime } from './src/runtime'

  export let type = 'div'
  export let staticClass = ''
  export let computedStyles = []
  export let variants = {}
  export let styleProps = {}

  $: pinceauClass = usePinceauRuntime(staticClass, computedStyles, variants, styleProps)
</script>

<svelte:element this={type} class={pinceauClass}>
  <slot />
</svelte:element>
