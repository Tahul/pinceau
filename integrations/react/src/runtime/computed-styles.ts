import { useState } from 'react'
import { computedStylesToDeclaration } from '@pinceau/runtime'
import type { ComputedStyleDefinition } from '@pinceau/style'
import { usePinceauContext } from '$pinceau/react-plugin'

export function useComputedStyles(fns?: [string, ComputedStyleDefinition][], props: any = {}) {
  const { runtimeSheet } = usePinceauContext()

  const [className, setClassName] = useState<string>()

  console.log(fns)

  const newClassName = runtimeSheet.getRule(
    computedStylesToDeclaration(
      (fns || []).map(([varName, fn]) => [varName, fn(props || {})] as [string, ReturnType<ComputedStyleDefinition>]),
    ),
    className,
  )

  if (className !== newClassName) { setClassName(() => newClassName) }

  return newClassName
}
