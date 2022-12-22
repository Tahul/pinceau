import { nextTick } from 'vue'
import type { TokensFunctionOptions } from 'pinceau/types'

export function usePinceauRuntimeDebug(tokensHelperConfig: TokensFunctionOptions) {
  let nextTickGroup = []
  let nextTickCalled = false

  // Token not found message
  const TOKEN_NOT_FOUND_MESSAGE = (path, options) => {
    const { loc } = options
    const message = [
          `🔑 ${path}`,
    ]
    if (loc?.file) {
      message.push('')
      message.push(`🔗 ${loc.file}`)
    }
    if (loc?.type) {
      message.push('')
      message.push(`❓ Missing token inside a ${loc.type === 'v' ? 'variant' : 'computed style or CSS prop'}.`)
    }
    nextTickGroup.push(message.join('\n'))
    if (!nextTickCalled) {
      nextTick(() => {
        const title = '🖌️ Pinceau `runtime` encountered some errors!'
        if (import.meta.hot) { console.groupCollapsed(title) }
        else { console.log(title) }
        nextTickGroup.forEach((m) => {
          if (!import.meta.hot && process.server) { console.log('\n') }
          console.log(m)
          if (!import.meta.hot && process.server) { console.log('\n') }
        })
        console.log('‼️ This warning will be hidden from production and can be disabled using `dev: false` option.')
        if (import.meta.hot) { console.groupEnd() }
      })
      nextTickCalled = true
    }
  }

  // Reset on HMR
  if (import.meta.hot) {
    import.meta.hot.on('vite:afterUpdate', () => {
      nextTickGroup = []
      nextTickCalled = false
    })
  }

  tokensHelperConfig.onNotFound = TOKEN_NOT_FOUND_MESSAGE
}
