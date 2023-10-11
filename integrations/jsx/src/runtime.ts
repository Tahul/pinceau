import type { ComputedStyleDefinition, SupportedHTMLElements, Variants, VariantsProps } from '@pinceau/style'
import { computedStylesToDeclaration, variantsToDeclaration } from '@pinceau/runtime'
import { createElement, useState } from 'react'
import { usePinceauContext } from '$pinceau/react-plugin'

export function useComputedStyles(fns?: [string, ComputedStyleDefinition][], props: any = {}) {
  const { runtimeSheet } = usePinceauContext()

  const [className, setClassName] = useState<string>()

  const newClassName = runtimeSheet.getRule(
    computedStylesToDeclaration(
      (fns || []).map(([varName, fn]) => [varName, fn(props || {})] as [string, ReturnType<ComputedStyleDefinition>]),
    ),
    className,
  )

  if (className !== newClassName) { setClassName(() => newClassName) }

  return newClassName
}

export function useVariants(variants?: Variants, props?: React.FC['propTypes']) {
  const { runtimeSheet } = usePinceauContext()
  const [className, setClassName] = useState<string>()
  const [variantsClasses, setVariantsClasses] = useState<string>()

  const variantsProps = Object.entries(props || {}).reduce<VariantsProps>((acc, [propName, value]) => {
    if (Object.keys(variants || {}).includes(propName)) { acc[propName] = value as string | boolean | { [key: string]: string | boolean } }

    return acc
  }, {})

  const { classes: newVariantsClasses, declaration } = variantsToDeclaration(
    variants || {},
    variantsProps,
  )

  const newClassName = runtimeSheet.getRule(declaration, className)

  if (className !== newClassName) { setClassName(() => newClassName) }

  if (variantsClasses !== newVariantsClasses) { setVariantsClasses(() => newVariantsClasses) }

  return [newClassName, newVariantsClasses].filter(Boolean).join(' ')
}

export function usePinceauComponent<T extends {}>(staticClass?: string | undefined, computedStyles?: [string, ComputedStyleDefinition][], variants?: Variants, type?: SupportedHTMLElements) {
  return (props: T) => {
    const pinceauClasses = usePinceauRuntime(staticClass, computedStyles, variants, props)

    return createElement(
      type || 'div',
      {
        ...props,
        className: pinceauClasses,
      },
    )
  }
}

export function usePinceauRuntime(
  staticClass?: string | undefined,
  computedStyles?: [string, ComputedStyleDefinition][],
  variants?: Variants,
  props?: any,
) {
  let computedStylesClass: string | undefined
  if (computedStyles && computedStyles.length) { computedStylesClass = useComputedStyles(computedStyles, props) }

  let variantsClass: string | undefined
  if (variants && Object.keys(variants).length) { variantsClass = useVariants(variants, props) }

  return [
    staticClass,
    computedStylesClass,
    variantsClass,
    props?.className,
  ].filter(Boolean).join(' ')
}
