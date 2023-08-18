import { describe, expect, it } from 'vitest'
import PinceauPlugin from 'pinceau/plugin'
import PinceauCore from '@pinceau/core/plugin'
import PinceauTheme from '@pinceau/theme/plugin'
import PinceauStyle from '@pinceau/style/plugin'
import PinceauVue from '@pinceau/vue/plugin'
import PinceauRuntime from '@pinceau/runtime/plugin'

describe('pinceau (main)', () => {
  it('Pinceau plugin export to exist', () => {
    expect(PinceauPlugin).toBeDefined()
  })

  it('Expect plugin to return array of Pinceau plugins', () => {
    expect(PinceauPlugin().length).toEqual([PinceauCore, PinceauTheme, PinceauStyle, PinceauVue, PinceauRuntime].length)
  })

  it('Expect plugin to disable plugins set to false', () => {
    expect(PinceauPlugin({ runtime: false, style: false, vue: false }).length).toEqual([PinceauCore, PinceauTheme].length)
  })
})
