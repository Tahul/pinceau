import type { DtFunction, PinceauOptions, PinceauThemeSheet } from '@pinceau/shared'
import { createUnplugin } from 'unplugin'
import type { ComputedRef } from 'vue'

export * as transforms from './transforms'

export const PinceauVuePlugin = createUnplugin<PinceauOptions>(() => {
  return {
    name: 'pinceau:vue',

    enforce: 'pre',

    vite: {
      handleHotUpdate(hmrContext) {
      // Enforce <style lang="ts"> into <style lang="postcss">
        const defaultRead = hmrContext.read
        hmrContext.read = async function () {
          const code = await defaultRead()
          return code /* transformStyleTs(code, undefined, true) */
        }
      },
    },

    /*
    transformInclude(id) {
      let toRet

      // Use Vue's query parser
      const query = parsePinceauQuery(id)

      // Stop on excluded paths
      if (
        options.excludes
        && options.excludes.some(path => id.includes(path))
      ) { toRet = false }

      // Run only on Nuxt loaded components
      if (
        toRet !== false
        && options.includes
        && options.includes.some(path => id.includes(path))
      ) { toRet = true }

      // Allow transformable files
      if (toRet !== false && query?.transformable) { toRet = true }

      // Push included file into context
      if (toRet) { pinceauContext.addTransformed(id) }

      return toRet
    },
    */

    /*
    transform(code, id) {
      if (!code) { return }

      const query = parsePinceauQuery(id)

      code = transformStyleTs(code, query)

      const transformContext: PinceauTransformContext = useTransformContext(code, query, pinceauContext)

      transformComponent(
        transformContext,
        pinceauContext,
      )

      return transformContext.result()
    },
    */

    /*
    load(id) {
      // Parse query
      const query = parsePinceauQuery(id)

      // Transform Vue scoped query
      if (query.vue && query.type === 'style') {
        const component = loadComponentFile(query)

        try {
          if (component) {
            const transformContext = useTransformContext(component, query, pinceauContext)

            transformComponent(
              transformContext,
              pinceauContext,
            )

            return { code: transformContext.sfc?.styles?.[query.index!].content }
          }
        }
        catch (e) {
          console.log({ query, component, e })
        }
      }
    },
    */
  }
})

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dt: DtFunction
    $pinceau: ComputedRef<string>
    $pinceauTheme: PinceauThemeSheet
    $pinceauRuntime: any
  }
}
