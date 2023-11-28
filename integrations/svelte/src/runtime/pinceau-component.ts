import type { ComputedStyleDefinition, SupportedHTMLElements, Variants } from '@pinceau/style'
import PinceauComponent from '../component'

export function usePinceauComponent(
  type?: SupportedHTMLElements,
  staticClass?: string | undefined,
  computedStyles?: [string, ComputedStyleDefinition][],
  variants?: Variants,
) {
  let localVariants: Variants | undefined
  // let localAttrs: Record<string, string> | undefined

  const localComp = class PinceauSvelteComponent extends PinceauComponent {
    constructor(options) {
      const forwardedProps = {
        type: options.props.type || type,
        staticClass: options.props.staticClass || staticClass,
        computedStyles: options.props.computedStyles || computedStyles,
        variants: localVariants || options.props.variants || variants,
      }

      const styleProps = Object.assign({}, options.props)

      // Cleanup extraneous keys
      for (const key of [...Object.keys(forwardedProps), '$$scope', '$$slots']) {
        delete styleProps[key]
      }

      super({
        ...options,
        props: {
          $$scope: options?.props?.$$scope,
          $$slots: options?.props?.$$slots,
          ...forwardedProps,
          styleProps,
        },
      })
    }

    static withVariants = (
      variants: Variants,
    ) => {
      localVariants = variants
      return this
    }

    static withAttrs = (
      /* attrs: Record<string, string>, */
    ) => {
      // localAttrs = attrs
      return this
    }
  }

  return localComp
}
