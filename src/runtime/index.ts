import type { Plugin } from 'vue'
import { computed, getCurrentInstance, inject, onScopeDispose, watch } from 'vue'
// @ts-expect-error - Virtual
import { aliases, flattenedTheme } from 'virtual:pinceau/theme/flat'
import { createTokensHelper } from '../context/$tokens'
import { isToken, resolveVariableFromPath, sanitizeProps, transformTokensToVariable } from './helpers'
import { bindClass, getIds } from './instance'
import { usePinceauRuntimeState } from './state'
import { usePinceauStylesheet } from './stylesheet'

const $tokens = createTokensHelper(flattenedTheme, aliases, { flattened: true })

export const plugin: Plugin = {
  install(app) {
    const state = usePinceauRuntimeState()

    const { getStylesheetContent, updateStylesheet } = usePinceauStylesheet(state, $tokens)

    const setupPinceauRuntime = (
      props: any,
      variants: any,
    ) => {
      const instance = getCurrentInstance()

      const variantsPropsValues = computed(() => sanitizeProps(props, variants))

      const ids = computed(() => getIds(instance, variantsPropsValues.value, variants))

      watch(
        ids,
        (newIds, oldIds) => {
          state.push(newIds, variants, variantsPropsValues)
          bindClass(instance, newIds, oldIds)
        },
        {
          immediate: true,
        },
      )

      onScopeDispose(() => state.drop(ids.value))
    }

    app.config.globalProperties.$pinceau = setupPinceauRuntime
    app.config.globalProperties.$pinceauSsr = { getStylesheetContent, updateStylesheet }
    app.provide('pinceau', setupPinceauRuntime)
  },
}

export const utils = {
  resolveVariableFromPath,
  transformTokensToVariable,
  isToken,
}

/**
 * Entrypoint for Pinceau runtime features.
 */
export function usePinceauRuntime(
  props: any,
  variants: any,
): void {
  return (inject('pinceau') as any)(props, variants)
}
