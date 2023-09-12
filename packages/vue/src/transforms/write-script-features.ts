import type { PinceauTransformFunction } from '@pinceau/core'
import { usePinceauTransformContext } from '@pinceau/core/utils'
import { hasRuntimeStyling } from '../utils'
import { transformVariants } from './variants'
import { transformComputedStyles } from './computed-styles'

/**
 * Add runtime setup on a component <script setup>.
 */
export const transformSetupRuntime: PinceauTransformFunction = (
  transformContext,
  pinceauContext,
) => {
  const { target } = transformContext

  const imports: string[] = []

  const hasComputedStyles = hasRuntimeStyling(transformContext, 'computedStyles')
  const hasVariants = hasRuntimeStyling(transformContext, 'variants')

  if (!pinceauContext.options.runtime || !(hasComputedStyles || hasVariants)) { return }

  imports.push('usePinceauRuntime')

  target.prepend(`\nimport { ${imports.join(', ')} } from \'$pinceau\'\n`)

  target.append(`\nconst $pcClass = usePinceauRuntime(
    ${hasComputedStyles ? '$pcExtractedComputedStyles' : 'undefined'},
    ${hasVariants ? '$pcExtractedVariants' : 'undefined'}
  )\n`)
}

export const transformScriptFeatures: PinceauTransformFunction = (transformContext, pinceauContext) => {
  if (!transformContext?.state?.styleFunctions) { return }

  const hasRuntime = hasRuntimeStyling(transformContext)

  if (hasRuntime && transformContext.target?.attrs?.setup) {
    transformVariants(transformContext, pinceauContext)
    transformComputedStyles(transformContext, pinceauContext)
    transformSetupRuntime(transformContext, pinceauContext)
  }
}

export const transformAddRuntimeScriptTag: PinceauTransformFunction = (
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
    transformScriptFeatures(proxyContext, pinceauContext)

    // Append proxy block content as a <script setup> tag
    transformContext.ms.append(`\n\n<script setup lang="ts">${proxyContext?.result()?.code || ''}\n</script>`)
  }
}
