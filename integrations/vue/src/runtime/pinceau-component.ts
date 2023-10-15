import type { ComputedStyleDefinition, SupportedHTMLElements, Variants } from '@pinceau/style'
import { defineComponent, h } from 'vue'
import { usePinceauRuntime } from './pinceau-runtime'

export function usePinceauComponent<Props extends {} = {}, T extends SupportedHTMLElements = 'div'>(type?: T, staticClass?: string | undefined, computedStyles?: [string, ComputedStyleDefinition][], variants?: Variants, propNames?: string[]) {
  let _attrs = {}
  let _variants = variants

  const component: any = defineComponent<Props>(
    // @ts-ignore
    (props, { slots }) => {
      const pinceauClass = usePinceauRuntime(staticClass, computedStyles, _variants, props)

      return () => {
        return h(
          type as string,
          {
            class: pinceauClass.value,
            ..._attrs,
          },
          {
            default: slots.default,
          },
        )
      }
    },
    {
      name: `PinceauStyledComponent.${type}`,
      props: propNames as any,
    },
  )

  component.withVariants = (v: Variants) => {
    _variants = { ..._variants, ...v }
    return component
  }

  component.withAttrs = (newAttrs: { [key: string]: string | number | boolean }) => {
    _attrs = { ..._attrs, ...newAttrs }
    return component
  }

  return component
}
