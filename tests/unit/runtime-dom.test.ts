/**
 * @vitest-environment jsdom
 */

import fs from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { useRuntimeSheet, useStyleSheet, useThemeSheet } from '@pinceau/runtime'
import { toHash } from '@pinceau/core/runtime'
import { injectSheet } from '../utils'

describe('@pinceau/runtime', () => {
  describe('utils/sheet.ts', () => {
    it('should find theme sheet', () => {
      // Create stylesheet
      injectSheet('pinceau-theme')

      const sheet = useStyleSheet('pinceau-theme')

      expect(sheet).toBeDefined()
      expect(sheet.cssRules).toBeDefined()
    })
    it('should find runtime sheet', () => {
      // Create stylesheet
      injectSheet('pinceau-runtime')

      const sheet = useStyleSheet('pinceau-runtime')

      expect(sheet).toBeDefined()
      expect(sheet.cssRules).toBeDefined()
    })
  })

  describe('utils/theme-sheet.ts', () => {
    it('should create a theme object based on the root CSS variables', () => {
      injectSheet('pinceau-theme', fs.readFileSync(resolve(__dirname, '../../packages/outputs/theme.css')).toString())

      const { theme } = useThemeSheet()

      // Test responsive token output
      expect((theme as any).color.primary[1].value.$initial).toBe('var(--color-red-1)')
      expect((theme as any).color.primary[1].value.$dark).toBe('var(--color-red-8)')
      expect((theme as any).color.primary[2].value.$initial).toBe('var(--color-red-2)')
      expect((theme as any).color.primary[2].value.$dark).toBe('var(--color-red-7)')
      expect((theme as any).color.primary[3].value.$initial).toBe('var(--color-red-3)')
      expect((theme as any).color.primary[3].value.$dark).toBe('var(--color-red-6)')
      expect((theme as any).color.primary[4].value.$initial).toBe('var(--color-red-4)')
      expect((theme as any).color.primary[4].value.$dark).toBe('var(--color-red-5)')
      expect((theme as any).color.primary[5].value.$initial).toBe('var(--color-red-5)')
      expect((theme as any).color.primary[5].value.$dark).toBe('var(--color-red-4)')
      expect((theme as any).color.primary[6].value.$initial).toBe('var(--color-red-6)')
      expect((theme as any).color.primary[6].value.$dark).toBe('var(--color-red-3)')
      expect((theme as any).color.primary[7].value.$initial).toBe('var(--color-red-7)')
      expect((theme as any).color.primary[7].value.$dark).toBe('var(--color-red-2)')
      expect((theme as any).color.primary[8].value.$initial).toBe('var(--color-red-8)')
      expect((theme as any).color.primary[8].value.$dark).toBe('var(--color-red-1)')
      expect((theme as any).color.primary[9].value.$initial).toBe('var(--color-red-9)')
      expect((theme as any).color.primary[9].value.$dark).toBe('var(--color-red-0)')

      // Test regular tokens outputs
      expect((theme as any).space[0].value).toBe('0px')
      expect((theme as any).space[0].variable).toBe('var(--space-0)')

      // Test media tokens outputs
      expect((theme as any).media.xs.value).toBe('(min-width: 475px)')
    })

    it('should properly hydrate the theme object with updated values from the stylesheet', () => {
      // Modifying the stylesheet
      injectSheet('pinceau-theme', '@media { :root { --pinceau-mq: $initial; --color-background: blue; } }')

      const { hydrate, theme } = useThemeSheet({ hydrate: false })

      // Expect theme to be empty as hydration is disabled
      expect(theme).to.deep.equal({})

      // Hydrate lazily
      hydrate()

      // Theme should be hydrated
      expect(theme).to.deep.equal({
        color: {
          background: {
            value: 'blue',
            variable: 'var(--color-background)',
          },
        },
      })
    })

    it('should properly format token from existing sheet', () => {
      // Modifying the stylesheet
      injectSheet('pinceau-theme', '@media { :root { --pinceau-mq: $initial; --color-1: blue; } }')

      const { theme, formatToken } = useThemeSheet()

      // Expect theme to be empty as hydration is disabled
      expect(theme).to.deep.equal({ color: { 1: { value: 'blue', variable: 'var(--color-1)' } } })

      const token = formatToken(['color', '1'], 'red', '--color-1', '$light')

      expect(token).toEqual({ value: { $initial: 'blue', $light: 'red' }, variable: 'var(--color-1)' })
    })

    it('should properly format token new token in sheet', () => {
      // Modifying the stylesheet
      injectSheet('pinceau-theme', '@media { :root { --pinceau-mq: $initial; } }')

      const { formatToken } = useThemeSheet()

      const token = formatToken(['color', '1'], 'red', '--color-1', '$light')

      expect(token).toEqual({ value: { $light: 'red' }, variable: 'var(--color-1)' })
    })

    it('should properly format a token when the existing value is not an object and media query is $initial', () => {
      // Modifying the stylesheet
      injectSheet('pinceau-theme', '@media { :root { --pinceau-mq: $initial; --color-1: blue; } }')

      const { formatToken } = useThemeSheet()

      const token = formatToken(['color', '1'], 'red', '--color-1')

      expect(token).toEqual({ value: { $initial: 'red' }, variable: 'var(--color-1)' })
    })

    it('should return the set value without modification for media variable', () => {
      // Modifying the stylesheet
      injectSheet('pinceau-theme', '@media { :root { --pinceau-mq: $initial; --color-1: blue; } }')

      const { formatToken } = useThemeSheet()

      const token = formatToken(['color', '1'], 'red', '--media-1')

      expect(token).toEqual({ value: 'red', variable: 'var(--media-1)' })
    })

    it('should properly format a token with a deep nested path', () => {
      // Modifying the stylesheet
      injectSheet('pinceau-theme', '@media { :root { --pinceau-mq: $initial; --color-1-1: blue; } }')

      const { formatToken } = useThemeSheet()

      const token = formatToken(['color', '1', '1'], 'red', '--color-1-1', '$medium')

      expect(token).toEqual({ value: { $initial: 'blue', $medium: 'red' }, variable: 'var(--color-1-1)' })
    })

    it('should handle non-existing paths correctly when media query is not $initial', () => {
      // Modifying the stylesheet
      injectSheet('pinceau-theme', '@media { :root { --pinceau-mq: $initial; } }')

      const { formatToken } = useThemeSheet()

      const token = formatToken(['color', '2'], 'green', '--color-2', '$medium')

      expect(token).toEqual({ value: { $initial: undefined, $medium: 'green' }, variable: 'var(--color-2)' })
    })
  })

  describe('utils/runtime-sheet.ts', () => {
    it('should hydrate existing stylesheet rules', () => {
      // Inject some rules into the stylesheet
      // (You'll need to create appropriate style rules in a similar manner)
      injectSheet('pinceau-runtime', '@media { .phy[--] { --puid: pc-12345; } .pc-12345 { color: blue; } }')

      const runtimeSheet = useRuntimeSheet()

      // Hydrate the rules into the cache
      runtimeSheet.hydrate()

      // Check that the rules are properly hydrated into the cache
      expect(runtimeSheet.cache.has('pc-12345')).toBe(true)
    })

    it('should stringify the stylesheet correctly', () => {
      injectSheet('pinceau-runtime', '@media { .phy[--] { --puid: pc-12345; } .pc-12345 { color: blue; } }')

      const runtimeSheet = useRuntimeSheet()

      // Add some rules to the stylesheet
      runtimeSheet.getRule({ color: 'red' })

      // Get the stylesheet as a string
      const stylesheetString = runtimeSheet.toString()

      // Check that the stringified stylesheet contains the correct rule
      expect(stylesheetString).toContain('color: red')
    })

    it('should create and return a classname correctly', () => {
      injectSheet('pinceau-runtime', '@media { .phy[--] { --puid: pc-12345; } .pc-12345 { color: blue; } }')

      const runtimeSheet = useRuntimeSheet()

      // Get the classname for a rule
      const className = runtimeSheet.getRule({ color: 'green' })

      // Create the hash from the same rule
      const hashName = toHash({ color: 'green' })

      // Check that the classname is correct
      expect(className).toBe(`pc-${hashName}`)
    })

    it('should cache the created rule correctly', () => {
      injectSheet('pinceau-runtime', '@media { .phy[--] { --puid: pc-12345; } .pc-12345 { color: blue; } }')

      const runtimeSheet = useRuntimeSheet()

      // Get the classname for a rule
      const className = runtimeSheet.getRule({ color: 'green' })

      if (!className) { throw new Error('undefined classname') }

      // Check that the rule is present in the cache
      expect(runtimeSheet.cache.has(className)).toBe(true)
    })

    it('should delete a rule correctly', () => {
      injectSheet('pinceau-runtime', '@media { .phy[--] { --puid: pc-12345; } .pc-12345 { color: blue; } }')

      const runtimeSheet = useRuntimeSheet()

      // Create a rule and get its classname
      const className = runtimeSheet.getRule({ color: 'yellow' })

      if (!className) { throw new Error('undefined classname') }

      // Delete the rule
      runtimeSheet.deleteRule(className)

      // Check that the rule has been removed from the stylesheet and the cache
      expect(runtimeSheet.cache.has(className)).toBe(false)
      expect(runtimeSheet.toString()).not.toContain('color: yellow')
    })

    it('should decrement the member count correctly', () => {
      injectSheet('pinceau-runtime', '@media { .phy[--] { --puid: pc-12345; } .pc-12345 { color: blue; } }')

      const runtimeSheet = useRuntimeSheet()

      // Create a rule and get its classname
      const className = runtimeSheet.getRule({ color: 'purple' })

      if (!className) { throw new Error('undefined classname') }

      // Decrement the member count
      runtimeSheet.deleteMember(className)

      // Get the cached rule and check the member count
      const cachedRule = runtimeSheet.cache.get(className)

      if (!cachedRule) { throw new Error('undefined cachedRule') }

      expect(cachedRule.members).toBe(0)
    })

    it('do not flush used rules', () => {
      injectSheet('pinceau-runtime', '')

      const runtimeSheet = useRuntimeSheet()

      // Create some rules
      runtimeSheet.getRule({ color: 'orange' })
      runtimeSheet.getRule({ color: 'pink' })

      // Flush the rules
      const flushed = runtimeSheet.flush()

      // Check that the flushed rules contain the correct rules, and that the stylesheet and the cache are empty
      expect(flushed.map(r => r.rule.cssText)).toEqual(expect.arrayContaining([expect.stringContaining('color: orange'), expect.stringContaining('color: pink')]))
      expect(runtimeSheet.cache.size).toBe(2)
    })

    it('flush unused rules', () => {
      injectSheet('pinceau-runtime', '')

      const runtimeSheet = useRuntimeSheet()

      // Create some rules
      const className1 = runtimeSheet.getRule({ color: 'orange' })
      const className2 = runtimeSheet.getRule({ color: 'pink' })

      if (!className1 || !className2) { throw new Error('undefined className') }

      runtimeSheet.deleteMember(className1)
      runtimeSheet.deleteMember(className2)

      // Flush the rules
      const flushed = runtimeSheet.flush()

      // Check that the flushed rules contain the correct rules, and that the stylesheet and the cache are empty
      expect(flushed.map(r => r.rule.cssText)).toEqual(expect.arrayContaining([expect.stringContaining('color: orange'), expect.stringContaining('color: pink')]))
      expect(runtimeSheet.cache.size).toBe(0)
    })
  })
})
