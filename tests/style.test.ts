import { beforeAll, describe, expect, it } from 'vitest'
import { parsePinceauQuery, usePinceauContext, usePinceauTransformContext } from '@pinceau/core/utils'
import { resolveCSSCallees } from 'packages/style/src/utils/ast'
import type { PinceauContext } from '@pinceau/core'
import { resolveCSSFunctionContext } from 'packages/style/src/utils/css-function-context'
import { resolveTmp } from './utils'

describe('@pinceau/style', () => {
  describe('utils/ast.ts', () => {
    it('should resolve css() calls from an AST', () => {
      const code = 'css({ div: { color: \'red\' } })'
      const count = 0
      expect(resolveCSSCallees(code).length).toEqual(1)
    })
    it('should resolve all css() calls from an ast', () => {
      const code = 'css({ div: { color: \'red\' } })\ncss({ div: { color: \'yellow\' } })\ncss({ div: { color: \'green\' } })'
      expect(resolveCSSCallees(code).length).toEqual(3)
    })
  })

  describe('utils/css-function-context.ts', () => {
    let pinceauContext: PinceauContext

    beforeAll(() => {
      pinceauContext = usePinceauContext()
    })

    it('should return a valid css function context object', () => {
      const code = 'css({ div: { color: \'red\' } })'
      const query = parsePinceauQuery(resolveTmp('./components/css-function.ts'))
      const cssFunctions = resolveCSSCallees(code)
      const transformContext = usePinceauTransformContext(code, query, pinceauContext)

      const result = resolveCSSFunctionContext(transformContext, pinceauContext, cssFunctions[0], 0)

      console.log({ result })

      expect(result).toBeDefined()
      if (!result) { throw new Error('No css function context result!') }
      expect(result.css).toBe('div{color:red;}')
      expect(result.ast.type).toBe('ObjectExpression')
      expect(result.declaration.div.color).toBe('red')
    })
  })

  describe('utils/eval.ts', () => {

  })

  describe('transforms/css-function.ts', () => {

  })
})
