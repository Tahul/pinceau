import { beforeAll, describe, expect, it } from 'vitest'
import { config, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { plugin as pinceau } from '../src/runtime'
import * as Components from './fixtures/shared/components'

beforeAll(
  () => {
    config.plugins.VueWrapper.extend = (instance) => {
      // @ts-expect-error - ?
      instance.__app.use(pinceau)
    }
  },
)

describe('transforms', () => {
  it('can transform components', async () => {
    for (const component of Object.entries(Components)) {
      expect(component).toBeTruthy()

      const mounted = mount(
        component[1],
        {
          props: {
            color: 'red',
          },
        },
      )

      await nextTick()

      expect(mounted.html()).not.toBe('')
    }
  })
})
