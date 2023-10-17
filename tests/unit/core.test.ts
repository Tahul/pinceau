import fs, { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveConfig } from 'vite'
import {
  PINCEAU_STYLES_EXTENSIONS,
  PINCEAU_SUPPORTED_EXTENSIONS,
  evalDeclaration,
  expressionToAst,
  findCallees,
  findDefaultExport,
  getCharAfterLastImport,
  getDefaultOptions,
  getPinceauContext,
  isPathIncluded,
  load,
  loadFile,
  loadInclude,
  merger,
  normalizeOptions,
  parseAst,
  parsePinceauQuery,
  transform,
  transformInclude,
  usePinceauContext,
  usePinceauTransformContext,
  usePinceauVirtualContext,
  writeOutput,
} from '@pinceau/core/utils'
import Pinceau from 'pinceau/plugin'
import { createThemeHelper } from '@pinceau/theme/runtime'
import { REFERENCES_REGEX, get, set, toHash, tokensPaths } from '@pinceau/core/runtime'
import type { PinceauContext, PinceauQuery, PinceauTransformContext, PinceauTransforms, PinceauVirtualContext } from '@pinceau/core'
import { PinceauVueTransformer } from '@pinceau/vue/utils'
import type { CSSFunctionArgAST } from '@pinceau/style'
import { resolveFixtures, resolveTmp } from '../utils'

const defaults = getDefaultOptions()

describe('@pinceau/core', () => {
  describe('utils/ast.ts', () => {
    it('parse js/ts using parseAst', () => {
      const ast = parseAst('const test = true')
      expect(ast).toHaveProperty('type')
      expect(ast.start).toBe(0)
      expect(ast.end).toBe(17)
    })
    it('find the default export from a file using defaultExport', () => {
      const ast = parseAst('export default function foo () { console.log(`bar`); }')
      const defaultExport = findDefaultExport(ast)
      expect(defaultExport).toHaveProperty('type', 'FunctionDeclaration')
    })
    it('transform any expression to ast', () => {
      // eslint-disable-next-line no-template-curly-in-string
      const ast = expressionToAst('props => `$color.${props.color}`')
      expect(ast).toHaveProperty('type', 'ArrowFunctionExpression')
    })
    it('should find css() calls from an AST', () => {
      const ast = parseAst('css({ div: { color: \'red\' } })')
      expect(findCallees(ast, 'css').length).toEqual(1)
    })
    it('should resolve all css() calls from an ast', () => {
      const ast = parseAst('css({ div: { color: \'red\' } })\ncss({ div: { color: \'yellow\' } })\ncss({ div: { color: \'green\' } })')
      expect(findCallees(ast, 'css').length).toEqual(3)
    })
    it('should find styled() calls from an AST', () => {
      const ast = parseAst('styled({ color: \'red\' })')
      expect(findCallees(ast, 'styled').length).toEqual(1)
    })
    it('should resolve all styled() calls from an ast', () => {
      const ast = parseAst('styled({ color: \'red\' })\nstyled({ color: \'yellow\' })\nstyled({ color: \'green\' })')
      expect(findCallees(ast, 'styled').length).toEqual(3)
    })
    it('should return the correct character position after the last import statement in an AST with one import statement', () => {
      const script = `
        import module from 'module';
      `

      const ast = parseAst(script)

      const result = getCharAfterLastImport(ast)

      expect(result).toBe(37)
      expect(script.charAt(result)).toBe('\n')
    })
  })

  describe('utils/core-context.ts', () => {
    const options = normalizeOptions()

    let context: PinceauContext

    beforeEach(() => {
      context = usePinceauContext(options)
      context.fs = fs
    })

    it('context from options', () => {
      expect(context).toBeDefined()
      expect(context).toHaveProperty('options')
    })
    it('get context from a resolved Vite config', async () => {
      const config = await resolveConfig(
        {
          plugins: [
            Pinceau(),
          ],
        },
        'build',
      )
      const ctx = getPinceauContext(config)
      expect(ctx).toBeDefined()
    })
    it('registers a new output', () => {
      const importPath = 'test/import/path'
      const virtualPath = 'test/virtual/path'
      const content = 'test content'

      context.registerOutput(importPath, virtualPath, content)
      expect(context.getOutput(importPath)).toEqual(content)
    })
    it('gets an output ID by its import path', () => {
      const importPath = 'test/import/path'
      const virtualPath = 'test/virtual/path'

      context.registerOutput(importPath, virtualPath, 'test content')
      expect(context.getOutputId(importPath)).toEqual(importPath)
    })
    it('checks if a module is transformable', () => {
      const id = 'test/module/id'

      // Assuming there's an initial setup where the module is deemed transformable
      const query = context.isTransformable(id)

      expect(query).toBeDefined()
    })
    it('adds a transformed file', () => {
      const id = 'test/module/id'
      const query = parsePinceauQuery('test/module/id')
      context.addTransformed(id, query)
      expect(context.transformed[id]).toEqual({ ...query })
    })
    it('updates the Pinceau theme', () => {
      const newTheme = { color: { primary: 'blue' } }

      const updatedTheme = context.updateTheme(newTheme)
      expect(updatedTheme).toEqual(newTheme)
    })
    it('updates Pinceau utils', () => {
      const newUtils = { someUtility: 'function' }

      const updatedUtils = context.updateUtils(newUtils)
      expect(updatedUtils).toEqual(newUtils)
    })
    it('registers a new custom transformer', () => {
      const id = 'vue'
      context.registerTransformer(id, PinceauVueTransformer)
      expect(context.transformers[id]).toBe(PinceauVueTransformer)
    })
    it('apply load transformers', async () => {
      const id = 'vue'
      context.registerTransformer(id, PinceauVueTransformer)
      const componentPath = resolveFixtures('components/vue/TestStyle.vue')
      const query = parsePinceauQuery(componentPath)
      context.addTransformed(componentPath, query)
      const code = await load(componentPath, context)
      // Target fixture do have `<style lang="css">`; PinceauVueTransformer should turn this into a PostCSS block
      expect(code).toContain('<style pctransformed>')
    })
    it('registers a new module query filter', () => {
      const filterFn = () => true
      context.registerFilter(filterFn)
      expect(context.filters).toContain(filterFn)
    })
    it('filter out modules matching query filter', () => {
      const filterFn = query => query.id === '/test/path'
      context.registerFilter(filterFn)
      const result = context.isTransformable('/test/path')
      const resultUnfiltered = context.isTransformable('/test/path/unfiltered')
      expect(result).toBe(undefined)
      expect(resultUnfiltered).toBeTruthy()
    })
  })

  describe('utils/data.ts', () => {
    it('set() - basic nested key', () => {
      const obj: any = {}
      set(obj, 'a.b.c', 'value')
      expect(obj.a.b.c).toBe('value')
    })
    it('set() - overwrite existing value', () => {
      const obj: any = { a: { b: { c: 'oldValue' } } }
      set(obj, 'a.b.c', 'newValue')
      expect(obj.a.b.c).toBe('newValue')
    })
    it('set() - using paths array', () => {
      const obj: any = {}
      set(obj, ['a', 'b', 'c'], 'value')
      expect(obj.a.b.c).toBe('value')
    })
    it('set() - no overwrite of unrelated data', () => {
      const obj: any = { a: { x: 1 }, b: 2 }
      set(obj, 'a.b.c', 'value')
      expect(obj.a.x).toBe(1)
      expect(obj.b).toBe(2)
    })
    it('set() - use different splitter', () => {
      const obj: any = {}
      set(obj, 'a|b|c', 'value', '|')
      expect(obj.a.b.c).toBe('value')
    })
    it('set() - set non-object key', () => {
      const obj: any = { a: 'string' }
      set(obj, 'a.b.c', 'value')
      // Set on existing string keys throw.
      expect(obj.a.b.c).toBe('value')
    })
    it('get() - basic nested key', () => {
      const obj = { a: { b: { c: 'value' } } }
      const result = get(obj, 'a.b.c')
      expect(result).toBe('value')
    })
    it('get() - using paths array', () => {
      const obj = { a: { b: { c: 'value' } } }
      const result = get(obj, ['a', 'b', 'c'])
      expect(result).toBe('value')
    })
    it('get() - non-existing nested key', () => {
      const obj = { a: { b: {} } }
      const result = get(obj, 'a.b.c')
      expect(result).toBeUndefined()
    })
    it('get() - use different splitter', () => {
      const obj = { a: { b: { c: 'value' } } }
      const result = get(obj, 'a|b|c', '|')
      expect(result).toBe('value')
    })
    it('get() - stop at non-object key', () => {
      const obj = { a: 'string' }
      const result = get(obj, 'a.b.c')
      expect(result).toBeUndefined()
    })
    it('get() - get root key', () => {
      const obj = { a: 'value' }
      const result = get(obj, 'a')
      expect(result).toBe('value')
    })
    it('get() - empty path', () => {
      const obj = { a: 'value' }
      const result = get(obj, '')
      expect(result).toBeUndefined()
    })
    it('tokensPaths() - basic usage', () => {
      const obj = {
        a: {
          b: 'test',
          c: {
            d: { value: 'hello' },
            e: 'world',
          },
        },
      }
      const result = tokensPaths(obj)
      expect(result).toEqual([['a.b', 'test'], ['a.c.d', 'hello'], ['a.c.e', 'world']])
    })
    it('tokensPaths() - nested objects', () => {
      const obj = {
        x: {
          y: {
            z: 'nested',
          },
        },
      }
      const result = tokensPaths(obj)
      expect(result).toEqual([['x.y.z', 'nested']])
    })
    it('tokensPaths() - with arrays', () => {
      const obj = {
        arr: ['one', 'two', { value: 'three' }],
      }
      const result = tokensPaths(obj)
      expect(result).toEqual([['arr', obj.arr]])
    })
    it('tokensPaths() - object with .value and other keys', () => {
      const obj = {
        a: {
          b: { value: 'hello', anotherKey: 'ignored' },
        },
      }
      const result = tokensPaths(obj)
      expect(result).toEqual([['a.b', 'hello']])
    })
    it('tokensPaths() - empty object', () => {
      const obj = {}
      const result = tokensPaths(obj)
      expect(result).toEqual([])
    })
    it('tokensPaths() - object with only non-terminal nodes', () => {
      const obj = {
        a: {
          b: {},
        },
      }
      const result = tokensPaths(obj)
      expect(result).toEqual([])
    })
    it('tokensPaths() - supports responsive tokens', () => {
      const obj = {
        color: {
          responsiveColor: {
            value: {
              $initial: 'red',
              $dark: 'blue',
            },
          },
          responsiveColorFlat: {
            $initial: 'red',
            $dark: 'blue',
          },
        },
      }
      const result = tokensPaths(obj, ['$dark'])

      expect(result).toStrictEqual([
        ['color.responsiveColor', {
          $initial: 'red',
          $dark: 'blue',
        }],
        ['color.responsiveColorFlat', {
          $initial: 'red',
          $dark: 'blue',
        }],
      ])
    })
  })

  describe('utils/eval.ts', () => {
    it('should eval css declaration', () => {
      const css = parseAst('css({ div: { color: \'red\', backgroundColor: \'blue\', \'&:hover\': { color: \'green\' } } })')
      const callees = findCallees(css, 'css')
      const ast = callees[0].value.arguments[0] as CSSFunctionArgAST
      const declaration = evalDeclaration(ast)
      expect(declaration).toStrictEqual({ div: { 'color': 'red', 'backgroundColor': 'blue', '&:hover': { color: 'green' } } })
    })
  })

  describe('utils/filter.ts', () => {
    it('include path if not in excludes or includes', () => {
      const options: any = { style: { excludes: [], includes: [] } }
      expect(isPathIncluded('/src/styles/themes/dark.css', options)).toBe(true)
    })
    it('exclude path if it matches one in excludes and not in includes', () => {
      const options: any = { style: { excludes: ['/src/styles/themes'], includes: [] } }
      expect(isPathIncluded('/src/styles/themes/light.css', options)).toBe(false)
    })
    it('include path if it matches one in both includes and excludes', () => {
      const options: any = { style: { excludes: ['/src/styles/themes'], includes: ['/src/styles/themes/light.css'] } }
      expect(isPathIncluded('/src/styles/themes/light.css', options)).toBe(true)
    })
    it('include path if in includes and not in excludes', () => {
      const options: any = { style: { excludes: [], includes: ['/src/styles/reset.css', '/src/styles/themes'] } }
      expect(isPathIncluded('/src/styles/reset.css', options)).toBe(true)
    })
    it('exclude a JavaScript file if specified in excludes', () => {
      const options: any = { style: { excludes: ['/src/scripts'], includes: [] } }
      expect(isPathIncluded('/src/scripts/app.js', options)).toBe(false)
    })
    it('include a theme path when only the dark theme is excluded', () => {
      const options: any = { style: { excludes: ['/src/styles/themes/dark.css'], includes: [] } }
      expect(isPathIncluded('/src/styles/themes/light.css', options)).toBe(true)
    })
    it('not exclude a path if it partially matches an exclude pattern', () => {
      const options: any = { style: { excludes: ['/src/styles/themes'], includes: [] } }
      expect(isPathIncluded('/src/assets/themes/icon.png', options)).toBe(true)
    })
    it('handle scenarios with both root and nested paths', () => {
      const options: any = {
        style: {
          excludes: ['/src/styles', '/assets/images'],
          includes: ['/src/styles/fonts', '/assets/images/icons'],
        },
      }
      expect(isPathIncluded('/src/styles/fonts/arial.ttf', options)).toBe(true)
      expect(isPathIncluded('/src/styles/themes/dark.css', options)).toBe(false)
      expect(isPathIncluded('/assets/images/background.jpg', options)).toBe(false)
      expect(isPathIncluded('/assets/images/icons/add.png', options)).toBe(true)
    })
  })

  describe('utils/hash.ts', () => {
    const css = {
      'color': 'red',
      'backgroudColor': 'blue',
      '&:hover': { color: 'green' },
      '&:active': { color: 'blue' },
      '&:before': { content: '\'\'', color: 'red', display: 'block', left: 0, top: 0 },
    }

    it('can hash declaration', () => {
      const hash = toHash(css)

      expect(hash).toBeDefined()
    })
    it('get two different hashes for two declarations', () => {
      const hash = toHash(css)
      const secondHash = toHash({
        div: css,
      })

      expect(hash).toBeDefined()
      expect(secondHash).toBeDefined()
      expect(hash === secondHash).toBe(false)
    })
    it('get same hash when called twice with same declarations', () => {
      const hash = toHash(css)
      const secondHash = toHash(css)

      expect(hash).toBeDefined()
      expect(secondHash).toBeDefined()
      expect(hash === secondHash).toBe(true)
    })

    it('can hash giant declarations', () => {
      const bigCss = {}

      for (let i = 0; i < 10000; i++) { bigCss[`div-${i}`] = css }

      const hash = toHash(bigCss)
      const secondHash = toHash(bigCss)

      expect(hash).toBeDefined()
      expect(secondHash).toBeDefined()
      expect(hash === secondHash).toBe(true)
    })
  })

  describe('utils/load.ts', () => {
    const ctx = usePinceauContext()
    ctx.fs = fs

    it('can load files from a query', async () => {
      const testBasePath = resolveFixtures('components/vue/TestBase.vue')
      const query = parsePinceauQuery(testBasePath)
      const file = loadFile(query, ctx)
      const fileContent = (await import(`${testBasePath}?raw`)).default
      // Check that `loadFile` gives the same result as importing the file locally with `?raw`
      expect(file).toEqual(fileContent)
    })
    it('throws when file not found', async () => {
      const query = parsePinceauQuery('no-file.js')
      expect(() => loadFile(query, ctx)).toThrow()
    })
  })

  describe('utils/merger.ts', () => {
    it('merge objects', () => {
      const tokens = {
        color: {
          primary: '#ff0000',
          secondary: '#00ff00',
        },
      }
      const secondTokens = {
        color: {
          primary: '#0000ff',
        },
      }
      const result = merger(secondTokens, tokens)
      expect(result.color.primary).toBe('#0000ff')
    })
    it('properly overwrite arrays', () => {
      const tokens = {
        color: {
          primary: '#ff0000',
        },
        shadow: ['0px 0px 4px rgba(0, 0, 0, 0.1)', '32px 32px 128px rgba(0, 0, 0, 0.4)'],
      }
      const secondTokens = {
        shadow: ['0px 0px 4px rgba(0, 0, 0, 0.9)'],
      }
      const result = merger(secondTokens, tokens)
      expect(result.color.primary).toStrictEqual('#ff0000')
      expect(result.shadow).toStrictEqual(['0px 0px 4px rgba(0, 0, 0, 0.9)'])
    })
  })

  describe('utils/options.ts', () => {
    it('normalize options', () => {
      const options = {}
      const normalized = normalizeOptions(options)
      expect(normalized).toBeDefined()
      ;['cwd', 'debug', 'dev', 'theme', 'style', 'runtime'].forEach(
        property => expect(normalized).toHaveProperty(property),
      )
    })
    it('normalize plugin options', () => {
      const options = {}
      const normalized = normalizeOptions(options)
      expect(normalized).toBeDefined()
      ;['theme', 'style', 'runtime'].forEach(
        property => expect(normalized[property]).toEqual(defaults[property]),
      )
    })
    it('not add defaults when plugin set to false', () => {
      const options = {
        theme: false,
        style: false,
        vue: false,
      }
      const normalized = normalizeOptions(options)
      expect(normalized).toBeDefined()
      ;['theme', 'style'].forEach(
        property => expect(normalized[property]).toBe(false),
      )
      expect(normalized.runtime).toEqual(defaults.runtime)
    })
  })

  describe('utils/query.ts', () => {
    it('correctly extract filename, raw query, and extension', () => {
      const result = parsePinceauQuery('file.tsx?src=true&raw=true')
      expect(result.filename).toBe('file.tsx')
      expect(result.ext).toBe('tsx')
      expect(result.src).toBe('true')
      expect(result.raw).toBe(true)
    })
    it('handle Vue-specific query parameters', () => {
      const result = parsePinceauQuery('component.vue?type=script&lang=ts')
      expect(result.type).toBe('script')
      expect(result.lang).toBe('ts')
    })
    it('identify Vue Single File Component', () => {
      const result = parsePinceauQuery('component.vue')
      expect(result.sfc).toBe('vue')
    })
    it('identify style files', () => {
      PINCEAU_STYLES_EXTENSIONS.forEach((ext) => {
        const result = parsePinceauQuery(`style.${ext}`)
        expect(result.type).toBe('style')
      })
    })
    it('identify transformable files', () => {
      PINCEAU_SUPPORTED_EXTENSIONS.forEach((ext) => {
        const result = parsePinceauQuery(`file.${ext}`)
        expect(result.transformable).toBe(true)
      })
    })
    it('handle miscellaneous parameters', () => {
      const result = parsePinceauQuery('file.tsx?global=true&setup=true&transformed=false')
      expect(result.global).toBe(true)
      expect(result.setup).toBe(true)
      expect(result.transformed).toBeUndefined()
    })
    it('handle empty queries', () => {
      const result = parsePinceauQuery('file.tsx')
      expect(result.id).toBe('file.tsx')
      expect(result.filename).toBe('file.tsx')
      expect(result.src).toBeUndefined()
      expect(result.raw).toBeUndefined()
    })
    it('recognize the "lang.ts" query as TypeScript', () => {
      const result = parsePinceauQuery('component.vue?lang.ts=true')
      expect(result.lang).toBe('ts')
    })
    it('return the index as a number when provided', () => {
      const result = parsePinceauQuery('file.ts?index=5')
      expect(result.index).toBe(5)
    })
    it('set the scoped value based on the query', () => {
      const result = parsePinceauQuery('file.ts?scoped=my-scoped-id')
      expect(result.scoped).toBe('my-scoped-id')
    })
    it('detect Vue queries correctly', () => {
      const result = parsePinceauQuery('file.ts?vue')
      expect(result.vueQuery).toBe(true)
    })
    it('not detect as SFC if type or index are present', () => {
      let result = parsePinceauQuery('component.vue?type=script')
      expect(result.sfc).toBeUndefined()

      result = parsePinceauQuery('component.vue?index=2')
      expect(result.sfc).toBeUndefined()
    })
    it('not identify as style when neither extension nor lang match', () => {
      const result = parsePinceauQuery('file.js?lang=js')
      expect(result.type).toBe('script')
    })
    it('handle non-standard queries gracefully', () => {
      const result = parsePinceauQuery('file.tsx?random=true')
      expect(result.filename).toBe('file.tsx')
      expect(result.ext).toBe('tsx')
      // Check that non-defined parameters don't affect the object structure
      expect(result).not.toHaveProperty('random')
    })
    it('handles unexpected file extensions gracefully', () => {
      const result = parsePinceauQuery('file.unknownExt')
      expect(result.ext).toBe('unknownExt')
      expect(result.transformable).toBeUndefined()
    })
    it('handles empty string input gracefully', () => {
      const result = parsePinceauQuery('')
      expect(result.filename).toBe('')
      expect(result.ext).toBe('')
    })
    it('handles non-numeric index value gracefully', () => {
      const result = parsePinceauQuery('file.ts?index=not-a-number')
      expect(result.index).toBeNaN()
    })
    it('prioritizes lang parameter over file extension for determining type', () => {
      const result = parsePinceauQuery('file.js?lang=css')
      expect(result.type).toBe('style')
    })
    it('handles conflicting query parameters gracefully', () => {
      const result = parsePinceauQuery('file.js?lang=css&type=script')
      expect(result.type).toBe('style') // Assuming type parameter takes precedence
    })
  })

  describe('utils/regexes.ts', () => {
    it('match single token within a string', () => {
      const str = 'background-color: $color.primary.100'
      const matches = Array.from(str.matchAll(REFERENCES_REGEX))
      expect(matches).toHaveLength(1)
      expect(matches[0][0]).toBe('$color.primary.100')
    })
    it('match multiple tokens within a string', () => {
      const str = 'background: linear-gradient($color.primary.100, $color.secondary.200)'
      const matches = Array.from(str.matchAll(REFERENCES_REGEX))
      expect(matches).toHaveLength(2)
      expect(matches[0][0]).toBe('$color.primary.100')
      expect(matches[1][0]).toBe('$color.secondary.200')
    })
    it('match root tokens', () => {
      const str = 'backgroundColor: $color'
      const matches = Array.from(str.matchAll(REFERENCES_REGEX))
      expect(matches[0][0]).toBe('$color')
    })
    it('not match tokens without content', () => {
      const str = 'backgroundColor: $'
      const matches = Array.from(str.matchAll(REFERENCES_REGEX))
      expect(matches).toHaveLength(0)
    })
    it('match tokens with diverse content', () => {
      const str = 'padding: $spacing.4 $spacing.medium $10px'
      const matches = Array.from(str.matchAll(REFERENCES_REGEX))
      expect(matches).toHaveLength(3)
      expect(matches[0][0]).toBe('$spacing.4')
      expect(matches[1][0]).toBe('$spacing.medium')
      expect(matches[2][0]).toBe('$10px')
    })
  })

  describe('utils/theme-helper.ts', () => {
    const theme = {
      colors: {
        primary: {
          light: { value: '#E1F5FE' },
          main: { value: '#2196F3' },
          dark: { value: '#0D47A1' },
        },
        secondary: {
          light: { value: '#FFECB3' },
          main: { value: '#FFC107' },
          dark: { value: '#FFA000' },
        },
      },
      typography: {
        fontFamily: { value: 'Arial, sans-serif' },
        fontSize: {
          small: { value: '12px' },
          medium: { value: '16px' },
          large: { value: '24px' },
        },
      },
      spacing: {
        small: { value: '8px' },
        medium: { value: '16px' },
        large: { value: '32px' },
      },
      borders: {
        radius: { value: '4px' },
      },
    }

    const tokensHelper = createThemeHelper(theme)

    it('retrieve token objects by their path', () => {
      expect(tokensHelper('colors.primary.light')).to.deep.equal(theme.colors.primary.light)
      expect(tokensHelper('typography.fontFamily')).to.deep.equal(theme.typography.fontFamily)
    })
    it('return the entire theme when no token path is provided', () => {
      expect(tokensHelper()).to.deep.equal(theme)
    })
    it('return undefined for non-existent token paths', () => {
      expect(tokensHelper('colors.tertiary.light')).to.be.undefined
    })
    it('handle callbacks', () => {
      const callbackTheme = createThemeHelper(theme, {
        cb: ({ query, token }) => {
          expect(query).to.equal('colors.primary.light')
          expect(token).to.deep.equal(theme.colors.primary.light)
        },
      })

      callbackTheme('colors.primary.light')
    })
    it('handle nested token paths correctly', () => {
      expect(tokensHelper('colors.primary')).to.deep.equal(theme.colors.primary)
      expect(tokensHelper('typography.fontSize')).to.deep.equal(theme.typography.fontSize)
    })
    it('handle deeper nested token paths', () => {
      expect(tokensHelper('colors')).to.deep.equal(theme.colors)
      expect(tokensHelper('typography')).to.deep.equal(theme.typography)
    })
    it('return undefined for invalid nested paths', () => {
      expect(tokensHelper('colors.primary.extra')).to.be.undefined
      expect(tokensHelper('typography.extra')).to.be.undefined
    })
    it('handle non-object values in theme', () => {
      const themeWithValues = {
        ...theme,
        someNumber: { value: 123 },
        someBool: { value: true },
      }

      const helperWithValues = createThemeHelper(themeWithValues)
      expect(helperWithValues('someNumber')).to.deep.equal({ value: 123 })
      expect(helperWithValues('someBool')).to.deep.equal({ value: true })
    })
    it('not be affected by theme changes post-creation', () => {
      const _theme = { ...theme }

      const ctx = {
        get theme() {
          return _theme
        },
      }

      const tokensHelper = createThemeHelper(ctx.theme)

      // Modify the theme after creating the helper
      _theme.colors.primary.light = { value: '#FFFFFF' }

      expect(tokensHelper('colors.primary.light')).to.deep.equal({ value: '#FFFFFF' })
    })
    it('handle cases where theme is not provided', () => {
      const noThemeHelper = createThemeHelper()
      expect(noThemeHelper('colors.primary.light')).to.be.undefined
    })
    it('handle cases where theme is null or undefined', () => {
      const nullThemeHelper = createThemeHelper(null)
      const undefinedThemeHelper = createThemeHelper(undefined)
      expect(nullThemeHelper('colors.primary.light')).to.be.undefined
      expect(undefinedThemeHelper('colors.primary.light')).to.be.undefined
    })
  })

  describe('utils/transform-context.ts', () => {
    const componentPath = resolveFixtures('./components/theme-helper.ts')
    let code: string
    let pinceauContext: PinceauContext
    let transformContext: PinceauTransformContext
    let query: PinceauQuery

    beforeEach(() => {
      code = readFileSync(componentPath).toString()
      pinceauContext = usePinceauContext()
      query = parsePinceauQuery(componentPath)
      transformContext = usePinceauTransformContext(code, query, pinceauContext)
    })

    it('initialize the transform context correctly', () => {
      expect(transformContext.query).to.eql(parsePinceauQuery(componentPath))
      expect(transformContext.code).to.equal(code)
    })
    it('register new transforms correctly', () => {
      transformContext.registerTransforms({ scripts: [() => {}] })
      expect(transformContext.transforms.scripts).to.have.lengthOf(1)
      expect(transformContext.transforms.customs).to.have.lengthOf(0)
    })
    it('handle globals transformations correctly', async () => {
      transformContext.registerTransforms({
        globals: [
          (ctx) => {
            ctx.target.append('console.log(\'hello test\')')
          },
        ],
      })
      await transformContext.transform()
      const result = transformContext.result()
      expect(typeof result === 'object' ? result?.code : result).toContain('console.log(\'hello test\')')
    })
    it('return transformed result with SourceMap when modified', async () => {
      transformContext.registerTransforms({
        globals: [
          (ctx) => {
            ctx.target.append('console.log(\'hello test\')')
          },
        ],
      })
      await transformContext.transform()
      const result = transformContext.result()
      if (typeof result === 'object') {
        expect(result?.map).toHaveProperty('file')
        expect(result?.map).toHaveProperty('mappings')
        expect(result?.map).toHaveProperty('names')
      }
    })
    it('not return any result when not modified', () => {
      const result = transformContext.result()
      expect(result).toBeUndefined()
    })
  })

  describe('utils/unplugin.ts', () => {
    let ctx: PinceauContext

    beforeEach(() => {
      ctx = usePinceauContext()
      ctx.fs = fs
    })

    it('add files to context transformed on loadInclude', () => {
      const id = resolveFixtures('components/vue/TestBase.vue')
      loadInclude(id, ctx)
      expect(ctx.transformed[id]).toBeDefined()
    })
    it('skips excluded files on loadInclude', () => {
      const id = 'unknown/file'
      ctx.registerFilter((query) => {
        if (query.id === 'unknown/file') { return true }
      })
      loadInclude(id, ctx)
      expect(ctx.transformed[id]).toBeUndefined()
    })
    it('load files', async () => {
      const id = resolveFixtures('components/vue/TestBase.vue')
      loadInclude(id, ctx)
      const code = await load(id, ctx)
      const fileContent = (await import(`${id}?raw`)).default
      expect(code).toStrictEqual(fileContent)
    })
    it('check if files are included before running transforms', () => {
      const id = resolveFixtures('components/vue/TestBase.vue')
      const isIncluded = transformInclude(id, ctx)
      expect(isIncluded).toBe(false)
    })
    it('allow files added to transformed in context', () => {
      const id = resolveFixtures('components/vue/TestBase.vue')
      ctx.addTransformed(id, parsePinceauQuery(id))
      const isIncluded = transformInclude(id, ctx)
      expect(isIncluded).toBe(true)
    })
    it('transforms files', async () => {
      const id = resolveFixtures('components/vue/TestBase.vue')
      loadInclude(id, ctx)
      const code = await load(id, ctx)
      const suite: PinceauTransforms = {
        globals: [
          (ctx) => {
            ctx.target.append('// hello world')
          },
        ],
      }
      const result = await transform(code, id, suite, ctx)
      // @ts-expect-error
      expect(result.code).toContain('// hello world')
    })
  })

  describe('utils/virtual.ts', () => {
    let virtualStore: PinceauVirtualContext

    beforeEach(() => {
      virtualStore = usePinceauVirtualContext()
    })

    it('registers a new output in the virtual storage without writing to file', () => {
      const importPath = '/path/to/import'
      const virtualPath = '/virtual/path'
      const content = 'virtual content'

      vi.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {})

      virtualStore.registerOutput(importPath, virtualPath, content)

      expect(virtualStore.getOutput(importPath)).toEqual(content)
      expect(fs.writeFileSync).not.toHaveBeenCalled()
    })
    it('registers a new output in the virtual storage and writes to file', () => {
      const importPath = '/path/to/import'
      const virtualPath = '/virtual/path'
      const content = 'virtual content'
      const filePath = resolveTmp('virtual-storage-test.txt')

      vi.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {})

      virtualStore.registerOutput(importPath, virtualPath, content)
      writeOutput(importPath, filePath, virtualStore.outputs, fs)

      expect(virtualStore.getOutput(importPath)).toEqual(content)
      expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, content)
    })
    it('resolves the virtual module id from an import', () => {
      const importPath = '/path/to/import'
      const virtualPath = '/virtual/path'

      virtualStore.registerOutput(importPath, virtualPath, 'content')

      expect(virtualStore.getOutputId(virtualPath)).toEqual(importPath)
      expect(virtualStore.getOutputId(importPath)).toEqual(importPath)
    })
    it('resolves undefined when the virtual module id does not exist', () => {
      expect(virtualStore.getOutputId('/non/existent/path')).toBeUndefined()
    })
    it('updates outputs in storage', () => {
      const initialOutputs = {
        '/path/one': 'initial content one',
        '/path/two': 'initial content two',
      }

      virtualStore.outputs = initialOutputs

      const updatedOutputs = {
        '/path/one': 'updated content one',
      }

      virtualStore.updateOutputs(updatedOutputs)

      expect(virtualStore.getOutput('/path/one')).toEqual('updated content one')
      expect(virtualStore.getOutput('/path/two')).toEqual('initial content two')
    })
  })
})
