import { describe, expect, it } from 'vitest'
import { Pinceau } from 'pinceau/plugin'
import { PinceauCorePlugin } from '@pinceau/core/plugin'
import { PinceauThemePlugin } from '@pinceau/theme/plugin'
import { PinceauStylePlugin } from '@pinceau/style/plugin'
import { PinceauVuePlugin } from '@pinceau/vue/plugin'
import { PinceauRuntimePlugin } from '@pinceau/runtime/plugin'

describe('pinceau (main)', () => {
  it('Pinceau plugin export to exist', () => {
    expect(Pinceau).toBeDefined()
  })

  it('Expect plugin to return array of Pinceau plugins', () => {
    expect(Pinceau().length).toEqual([
      PinceauCorePlugin,
      PinceauThemePlugin,
      PinceauStylePlugin,
      PinceauVuePlugin,
      PinceauRuntimePlugin,
    ].length)
  })

  it('Expect plugin to disable plugins set to false', () => {
    expect(Pinceau({ runtime: false, style: false, vue: false }).length).toEqual([PinceauCorePlugin, PinceauThemePlugin].length)
  })
})
