import type { Plugin } from 'vue'
import { getCurrentInstance, reactive } from 'vue'

export interface PinceauRuntimeUtils {
  push: (id: string, value: any) => void
  drop: (id: String, value: string) => void
}

export const pinceauPlugin: Plugin = (app) => {
  const state = reactive({})

  const push = (id, value) => {
    console.log(value)
  }

  const drop = (id) => {
    console.log(id)
  }

  const utils: PinceauRuntimeUtils = { push, drop }

  app.provide(
    'pinceau',
    utils,
  )
}

export const usePinceauRuntime = () => {
  const instance = getCurrentInstance()
  return instance.$pinceau
}
