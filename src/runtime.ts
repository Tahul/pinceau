import type { Plugin } from 'vue'
import { getCurrentInstance, inject, reactive } from 'vue'

export interface PinceauRuntimeUtils {
  push: (value: any) => void
  drop: () => void
}

export const pinceauPlugin: Plugin = {
  install(app) {
    const state = reactive({})

    const getId = (): string => {
      const instance = getCurrentInstance()
      instance.attrs.__pid = instance.uid
      return (instance.vnode.type as any).__scopeId as string
    }

    const push = (id, value) => {
      console.log(value)
    }

    const drop = (id) => {
      console.log(id)
    }

    const utils: () => PinceauRuntimeUtils = () => {
      const id = getId()

      return {
        push: (value: any) => push(id, value),
        drop: () => drop(id),
      }
    }

    app.config.globalProperties.$pinceau = utils
    app.provide('pinceau', utils)
  },
}

export const usePinceauRuntime = (): PinceauRuntimeUtils => (inject('pinceau') as any)()
