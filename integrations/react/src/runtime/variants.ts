import { useState } from 'react'
import { variantsToDeclaration } from '@pinceau/runtime'
import type { Variants, VariantsProps } from '@pinceau/style'
import { usePinceauContext } from '$pinceau/react-plugin'

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
