import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import defu from 'defu'
import { nextTick } from 'vue'
import { plugin as pinceau } from '../src/runtime'
import * as Components from './fixtures/shared/components'
import theme from '#pinceau/theme/flat'

const mountWithPinceau: typeof mount = (
  component,
  options,
) => {
  return mount(component, {
    ...options,
    global: defu(
      options,
      {
        plugins: [
          [pinceau, { theme }],
        ],
      },
    ),
  })
}

describe('transforms', () => {
  // Mount each components in `shared/components`
  for (const component of Object.entries(Components)) {
    it(`can transform ${component[1].__name}`, async () => {
      expect(component).toBeTruthy()
      const mounted = mountWithPinceau(component[1])
      await nextTick()
      expect(mounted.html()).not.toBe('')
    })
  }
})
