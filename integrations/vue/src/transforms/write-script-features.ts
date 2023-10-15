import type { PinceauTransformFunction } from '@pinceau/core'
import { usePinceauTransformContext } from '@pinceau/core/utils'
import { generatePinceauRuntimeFunction, generateStyledComponent, hasIdentifier, hasRuntimeStyling, isSelfBindingFunction } from '@pinceau/style/utils'
import type { PropOptions } from './variants'
import { pushVariantsProps, resolveVariantsProps, sanitizeVariantsDeclaration } from './variants'

/**
 * Write all runtime styles from a file in a <script> block.
 */
export const transformWriteScriptFeatures: PinceauTransformFunction = (transformContext, pinceauContext) => {
  if (!transformContext?.state?.styleFunctions) { return }

  const { target } = transformContext

  if (!pinceauContext.options.runtime) { return }

  let fileHasRuntime: boolean = false

  let selfBindingProps: { [key: string]: PropOptions } = {}

  let fileHasStyledComponent: boolean = false

  for (const [id, styleFn] of Object.entries(transformContext?.state?.styleFunctions || {})) {
    // Skip already applied functions; usually when having multiple <script> in the same file.
    if (styleFn.applied.runtime) { continue }

    const hasRuntime = !!(styleFn.computedStyles.length || Object.keys(styleFn.variants).length)

    // Avoid another hasRuntime check later on
    if (!fileHasRuntime) { fileHasRuntime = !!hasRuntime }

    // Every arguments resolved from `usePinceauRuntime`
    const runtimeParts: { staticClass: string; computedStyles: string | undefined; variants: string | undefined; propNames: string[] } = {
      staticClass: styleFn.className ? `\`${styleFn.className}\`` : 'undefined',
      propNames: styleFn.propNames,
      computedStyles: undefined,
      variants: undefined,
    }

    // Resolve Computed Styles functions
    if (styleFn?.computedStyles?.length) {
      runtimeParts.computedStyles = `[${styleFn
        .computedStyles
        .map(computedStyle => `[\'${computedStyle.variable}\', ${computedStyle.compiled}]`)
        .join(', \n')
      }]`
    }

    // Resolve variants
    const localVariantsProps: undefined | { [key: string]: PropOptions } = undefined
    if (Object.keys(styleFn?.variants || {}).length) {
      const localVariantsProps = resolveVariantsProps(styleFn.variants, target?.attrs?.lang === 'ts')

      // Append `useVariants({ ...sanitizedVariants })` for runtime usage
      if (Object.keys(localVariantsProps).length) {
        if (isSelfBindingFunction({ id })) {
          selfBindingProps = { ...selfBindingProps, ...(localVariantsProps || {}) }
        }

        runtimeParts.variants = JSON.stringify(sanitizeVariantsDeclaration(styleFn.variants))
      }
    }

    styleFn.applied.runtime = true

    // <template> runtime styles
    if (id.startsWith('template')) {
      if (hasRuntime) { target.append(`\nconst \$${id} = ${generatePinceauRuntimeFunction(localVariantsProps, runtimeParts)}\n`) }
      continue
    }

    // The first `styled` binding made from a `<style>` block will be linked to root template element.
    if (id.startsWith('style') && id.endsWith('styled0')) {
      if (hasRuntime) { target.append(`\nconst \$${id} = ${generatePinceauRuntimeFunction(localVariantsProps, runtimeParts)}\n`) }
      else { target.append(`\nconst \$${id} = ${runtimeParts.staticClass}`) }
      continue
    }

    // <style> runtime styles
    if (id.startsWith('style')) {
      if (hasRuntime) { target.append(`\n${generatePinceauRuntimeFunction(localVariantsProps, runtimeParts)}\n`) }
      continue
    }

    // <script> runtime styles; if no runtime style is detected, use a raw string for the classname.
    if (id.startsWith('script')) {
      if (styleFn.element) {
        fileHasStyledComponent = true
        target.overwrite(
          styleFn.callee.value.start,
          styleFn.callee.value.end,
          generateStyledComponent(styleFn, runtimeParts, true),
        )
        continue
      }
      if (hasRuntime) {
        target.overwrite(
          styleFn.callee.value.start,
          styleFn.callee.value.end,
        `${generatePinceauRuntimeFunction(localVariantsProps, runtimeParts)}\n`,
        )
        continue
      }
      else if (hasIdentifier(styleFn)) {
        target.overwrite(
          styleFn.callee.value.start,
          styleFn.callee.value.end,
          runtimeParts.staticClass,
        )
        continue
      }
    }

    // Cleanup the call anyways
    target.overwrite(
      styleFn.callee.value.start,
      styleFn.callee.value.end,
      '',
    )
  }

  // Push variants props
  if (Object.keys(selfBindingProps).length) { pushVariantsProps(transformContext, selfBindingProps) }

  // If runtime styling has been found, finally prepend the import
  const imports: string[] = []
  if (fileHasRuntime) { imports.push('usePinceauRuntime') }
  if (fileHasStyledComponent) { imports.push('usePinceauComponent') }
  if (imports.length) { target.prepend(`\nimport { ${imports.join(', ')} } from '@pinceau/vue/runtime'\n`) }
}

/**
 * If no <script> tag has been found in file:
 * - Create a temporary one
 * - Write transforms in it
 * - Append it to the component.
 */
export const transformAddRuntimeScriptTag: PinceauTransformFunction = async (
  transformContext,
  pinceauContext,
) => {
  if (transformContext.sfc && !transformContext.sfc.scripts.length && hasRuntimeStyling(transformContext)) {
    // Create proxy transform context
    const proxyContext = usePinceauTransformContext('', transformContext.query, pinceauContext)

    // Create proxy block
    const targetBlock = proxyContext.target
    targetBlock.attrs = {
      setup: true,
    }
    targetBlock.type = 'script'
    targetBlock.index = 0

    // Assign target block
    proxyContext.target = targetBlock

    // Apply script features on empty script block
    transformWriteScriptFeatures(proxyContext, pinceauContext)

    // Append proxy block content as a <script setup> tag
    transformContext.ms.append(`\n\n<script setup lang="ts">${proxyContext?.result()?.code || ''}\n</script>`)
  }
}
