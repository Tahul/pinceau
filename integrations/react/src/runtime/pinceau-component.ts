import { createElement } from 'react'
import type { ComputedStyleDefinition, SupportedHTMLElements, Variants } from '@pinceau/style'
import { usePinceauRuntime } from './pinceau-runtime'

export function usePinceauComponent<T extends {}>(type?: SupportedHTMLElements, staticClass?: string | undefined, computedStyles?: [string, ComputedStyleDefinition][], variants?: Variants) {
  let localAttrs = {}

  const component = (
    props: T,
  ) => {
    const pinceauClasses = usePinceauRuntime(staticClass, computedStyles, variants, props)

    return createElement(
      type || 'div',
      {
        ...props,
        className: pinceauClasses,
        ...(localAttrs || {}),
      },
    )
  }

  component.withVariants = (_variants) => {
    variants = { ...variants, ..._variants }
    return component
  }

  component.withAttrs = attrs => (localAttrs = attrs)

  return component
}
