import { defineTheme } from '../src/index'

export default defineTheme({
  color: {
    testSimple: 'violet',
    test: {
      initial: 'red',
      dark: 'blue',
    },
    testReference: '{color.testSimple}',
    testSimpleReference: '{color.test}',
  },
})
