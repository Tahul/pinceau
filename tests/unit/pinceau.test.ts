import { describe, expect, it } from 'vitest'
import Pinceau from 'pinceau/plugin'
import PinceauCorePlugin from '@pinceau/core/plugin'
import PinceauThemePlugin from '@pinceau/theme/plugin'
import PinceauStylePlugin from '@pinceau/style/plugin'
import PinceauRuntimePlugin from '@pinceau/runtime/plugin'

describe('pinceau (main)', () => {
  it('pinceau plugin export to exist', () => {
    expect(Pinceau).toBeDefined()
  })

  it('expect plugin to return array of Pinceau plugins', () => {
    expect(Pinceau().length).toEqual([
      PinceauCorePlugin,
      PinceauThemePlugin,
      PinceauStylePlugin,
      PinceauRuntimePlugin,
    ].length)
  })

  it('expect plugin to disable plugins set to false', () => {
    expect(Pinceau({ runtime: false, style: false, vue: false, svelte: false, jsx: false }).length).toEqual([PinceauCorePlugin, PinceauThemePlugin].length)
  })
})
