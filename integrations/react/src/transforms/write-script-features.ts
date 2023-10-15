import type { PinceauTransformFunction } from '@pinceau/core'
import { usePinceauTransformContext } from '@pinceau/core/utils'
import { generatePinceauRuntimeFunction, generateStyledComponent, hasIdentifier, hasRuntimeStyling } from '@pinceau/style/utils'
import type { RuntimeParts } from '@pinceau/style'
import type { PropOptions } from './variants'
import { resolveVariantsProps, sanitizeVariantsDeclaration } from './variants'

/**
 * Write all runtime styles from a file in a <script> block.
 */
export const transformWriteScriptFeatures: PinceauTransformFunction = (transformContext, pinceauContext) => {
  if (!transformContext?.state?.styleFunctions) { return }

  const { target } = transformContext

  if (!pinceauContext.options.runtime) { return }

  let fileHasRuntime: boolean = false

  let fileHasStyledComponent: boolean = false

  for (const [id, styleFn] of Object.entries(transformContext?.state?.styleFunctions || {})) {
    let variantsProps: { [key: string]: PropOptions } = {}

    // Skip already applied functions; usually when having multiple <script> in the same file.
    if (styleFn.applied.runtime) { continue }

    const hasRuntime = !!(styleFn.computedStyles.length > 0 || Object.keys(styleFn.variants).length > 0)

    // Avoid another hasRuntime check later on
    if (!fileHasRuntime) { fileHasRuntime = !!hasRuntime }

    // Every arguments resolved from `usePinceauRuntime`
    const runtimeParts: RuntimeParts = {
      staticClass: styleFn.className ? `\`${styleFn.className}\`` : 'undefined',
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
    if (Object.keys(styleFn?.variants || {}).length) {
      const localVariantsProps = resolveVariantsProps(
        styleFn.variants,
        target?.attrs?.lang === 'ts',
      )

      // Append `useVariants({ ...sanitizedVariants })` for runtime usage
      if (Object.keys(localVariantsProps).length) {
        variantsProps = { ...variantsProps, ...(localVariantsProps || {}) }
        runtimeParts.variants = JSON.stringify(sanitizeVariantsDeclaration(styleFn.variants))
      }
    }

    styleFn.applied.runtime = true

    // Runtime styles; if no runtime style is detected, use a raw string for the classname.
    if (id.startsWith('script')) {
      if (styleFn.element) {
        fileHasStyledComponent = true
        target.overwrite(
          styleFn.callee.value.start,
          styleFn.callee.value.end,
          generateStyledComponent(styleFn, runtimeParts),
        )
        continue
      }
      if (hasRuntime) {
        target.overwrite(
          styleFn.callee.value.start,
          styleFn.callee.value.end,
        `${generatePinceauRuntimeFunction(variantsProps, runtimeParts, true)}\n`,
        )
        continue
      }
      else if (hasIdentifier(styleFn)) {
        target.overwrite(
          styleFn.callee.value.start,
          styleFn.callee.value.end,
          runtimeParts?.staticClass || 'undefined',
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

  // If runtime styling has been found, finally prepend the import
  const imports: string[] = []
  if (fileHasRuntime) { imports.push('usePinceauRuntime') }
  if (fileHasStyledComponent) { imports.push('usePinceauComponent') }
  if (imports.length) { target.prepend(`\nimport { ${imports.join(', ')} } from '@pinceau/react/runtime'\n`) }
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
    transformContext.ms.append(`\n\n<script lang="ts">${proxyContext?.result()?.code || ''}\n</script>`)
  }
}
