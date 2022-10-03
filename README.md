# 🖌 pinceau

[![NPM version](https://img.shields.io/npm/v/pinceau?color=a1b858&label=)](https://www.npmjs.com/package/pinceau)

A _CSS-in-TS_ framework built to feel like a native Vue feature.

[🎨 Start painting](https://stackblitz.com/github/Tahul/vitesse-pinceau?file=src%2FApp.vue) • [🚧 Documentation](#install)

- Ships **0kb** of **JS** to the client by default
- **DX** that feels like a native Vue feature
- [Design Tokens](https://github.com/design-tokens/community-group) compatible configuration system
- Fully-typed styling API
- Integrated with [Volar](https://github.com/johnsoncodehk/volar)
- Plug & play with  [Nuxt 3](https://v3.nuxtjs.org), [Vitesse](https://github.com/antfu/vitesse), [@vitejs/plugin-vue](https://github.com/vitejs/vite/tree/main/packages/plugin-vue)

#### 🚨 Warning

> Pinceau is still under heavy development, if you are missing some parts of the documentation, please [open an issue](https://github.com/Tahul/pinceau) and describe your problem. I'll be happy to help.

## ⚙️ Install

```bash
npm i pinceau
```

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
export default defineNuxtConfig({
  modules: [
    'pinceau/nuxt',
  ],
  pinceau: {
    ...PinceauOptions
  }
})
```

Example: [`playground/`](./playground/)

> This module only works with [Nuxt 3](https://v3.nuxtjs.org).

</details>

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import Pinceau from 'pinceau/vite'

export default defineConfig({
  plugins: [
    Pinceau(PinceauOptions),
  ],
})
```

Example: [`playground/`](./playground/)

</details>

<details>
<summary>PinceauOptions</summary>

<br/>

```ts
export interface PinceauOptions {
  /**
   * The root directory of your project.
   *
   * @default process.cwd()
   */
  cwd?: string
  /**
   * The path of your configuration file.
   */
  configOrPaths?: ConfigOrPaths
  /**
   * The path of your configuration file.
   *
   * @default 'pinceau.config'
   */
  configFileName?: string
  /**
   * A callback called each time your config gets resolved.
   */
  configResolved?: (config: PinceauTheme) => void
  /**
   * The directry in which you store your design tokens.
   *
   * @default 'tokens'
   */
  tokensDir?: string
  /**
   * The directory in which you want to output the built version of your configuration.
   */
  outputDir?: string
  /**
   * Imports the default CSS reset in the project.
   *
   * @default true
   */
  preflight?: boolean
  /**
   * Excluded transform paths.
   */
  excludes?: string[]
  /**
   * Included transform paths.
   */
  includes?: string[]
  /**
   * Toggles color .{dark|light} global classes.
   *
   * If set to class, all @dark and @light clauses will also be generated
   * with .{dark|light} classes on <html> tag as a parent selector.
   *
   * @default 'class'
   */
  colorSchemeMode?: 'media' | 'class'
}
```

</details>

<details>
<summary>Volar</summary>

<br>

If you want to have all autocomplete and TypeScript powered features, you need to setup [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) in your IDE.

That also means these features sadly won't work in the [StackBlitz playground](https://stackblitz.com/github/Tahul/vitesse-pinceau?file=src%2FApp.vue), unless they provide support for it at some point.

Once Volar enabled, add the Pinceau plugin to your `tsconfig.json`:

```json
{
  "vueCompilerOptions": {
    "plugins": ["pinceau/volar"]
  }
}
```

Once enabled, be sure to restart your TypeScript server, and enjoy autocompletion!

</details>

## 🎨 Configure

The configuration file is made to help you injecting all the [Design Tokens](https://github.com/design-tokens/community-group) you want into your app as CSS variables, JS references, or any other format you need or want.

### pinceau.config.ts

You can decide to follow the [suggested theme definition keys](src/types/theme.ts#112), but you also are free to define whatever design tokens you want, with the structure of your choice.

As an example, this configuration helped us at NuxtLabs to create a sync between [Figma Tokens](https://docs.figmatokens.com/) and our component library.

<details>
<summary>
<b>💡 Configuration example</b>
</summary>
<br/>

```ts
import { defineTheme } from 'pinceau'

export default defineTheme({
  screens: {
    'xs': { value: '475px' },
    'sm': { value: '640px' },
    'md': { value: '768px' },
    'lg': { value: '1024px' },
    'xl': { value: '1280px' },
    '2xl': { value: '1536px' },
  },
  colors: {
    primary: {
      value: '#B6465F'
    },
    orange: {
      50: {
        value: '#ffe9d9',
      },
      100: {
        value: '#ffd3b3',
      },
      200: {
        value: '#ffbd8d',
      },
      300: {
        value: '#ffa666',
      },
      400: {
        value: '#ff9040',
      },
      500: {
        value: '#ff7a1a',
      },
      600: {
        value: '#e15e00',
      },
      700: {
        value: '#a94700',
      },
      800: {
        value: '#702f00',
      },
      900: {
        value: '#381800',
      }
    }
  }
})
```
</details>

<details>
<summary>
<b>🎨 Output example</b>
</summary>
<br/>

```css
:root {
  --screens-xs: 475px;
  --screens-sm: 640px;
  --screens-md: 768px;
  --screens-lg: 1024px;
  --screens-xl: 1280px;
  --screens-2xl: 1536px;
  --color-primary: #B6465F;
  --colors-orange-50: #ffe9d9;
  --colors-orange-100: #ffd3b3;
  --colors-orange-200: #ffbd8d;
  --colors-orange-300: #ffa666;
  --colors-orange-400: #ff9040;
  --colors-orange-500: #ff7a1a;
  --colors-orange-600: #e15e00;
  --colors-orange-700: #a94700;
  --colors-orange-800: #702f00;
  --colors-orange-900: #381800;
}
```
</details>

Out of your configuration file, **Pinceau** will generate multiple output targets which will provide:

- Type completion in `css()` function for [mapped theme tokens](https://github.com/Tahul/pinceau/blob/main/src/types/theme.ts#L132-L255)
- Token paths completion with globally available `$dt()` helper
- Globally injected CSS variables
- A lot more for you to discover, and for me to document ✨

This is powered by [style-dictionary](https://github.com/amzn/style-dictionary) and runs on [style-dictionary-esm](https://github.com/Tahul/style-dictionary-esm).

## 🖌 Paint

Pinceau styling API is made to feel like a native Vue API.

To do so, it fully takes advantages of the Vue components `<style>` tags, and tries to give it even more super powers.

### `css()`

Pinceau enables `lang="ts"` as a valid attribute for `<style>` or `<style scoped>` tags.

That enables the usage of another internal API, `css()`.

```vue
<style lang="ts">
css({
  div: {
    color: '{colors.primary}',
    backgroundColor: '{colors.orange.50}'
  }
})
</style>
```

The `css()` function has mutliple features:

- Based on [`@stitches/stringify`](https://www.npmjs.com/package/@stitches/stringify)

- Autocomplete CSS properties from [`csstype`](https://github.com/frenic/csstype)

- Autocomplete CSS values from theme design tokens

  <details>
  <summary>💡 Example</summary>
  <br>
  
  ```vue
  <style lang="ts">
  css({
    color: '{*}', < Will autocomplete from all 'colors' keys,
    padding: '{*}', < Will autocomplete from 'space' keys
  })
  </style>
  ```

  That works with all nested keys in theme keys, as long as the values are a valid Design Token.

  You also get autocompletion from all browser values from [MDN](https://developer.mozilla.org/fr/docs/Web/CSS) thanks to [csstype](https://github.com/frenic/csstype).
  </details>

- Autocomplete root keys from your `<template>` elements

  <details>
  <summary>💡 Example</summary>
  <br>
  
  ```vue
  <template>
    <div>
      <button>
        Hello World!
      </button>
    </div>
  </template>

  <style lang="ts">
  css({
    '*' < Will autocomplete 'div' | 'button'
  })
  </style>
  ```

  </details>

- Supports [`postcss-nested`](https://github.com/postcss/postcss-nested) syntax

  <details>
  <summary>💡 Example</summary>
  <br>
  
  ```vue
  <style lang="ts">
  css({
    '.phone': {
      '&_title': {
        width: '500px',
        'body.is-variant &': {
          color: 'purple'
        }
      }
    }
  })
  </style>
  ```

  </details>

- Supports [`postcss-custom-properties`](https://github.com/postcss/postcss-custom-properties) syntax

  <details>
  <summary>💡 Example</summary>
  <br>
  
  ```vue
  <style lang="ts">
  css({
    '.phone': {
      '--custom-property': '{colors.primary.500}'
    }
  })
  </style>
  ```

  </details>

- Supports all custom features from Vue `<style>` attributes

  <details>
  <summary>💡 Example</summary>
  <br>
  
  ```vue
  <script setup>
  defineProps({
    color: {
      type: String,
      required: false,
      default: $dt('colors.primary.500')
    }
  })

  const myRef = ref()
  </script>

  <style lang="ts">
  css({
    '.phone': {
      '&:deep(...)': {},
      '&:slotted(...)': {},
      '&:global(...)': {},
      '--custom-property': 'v-bind(myRef)',
      color: 'v-bind(color)'
      // ^ This is autocompleted and shows type errors
    }
  })
  </style>
  ```

  These features get exact same autocomplete and type-safety as the would in a regular `<style>` tag.
  </details>

  Including [`:deep()`](https://vuejs.org/api/sfc-css-features.html#deep-selectors) , [`:slotted()`](https://vuejs.org/api/sfc-css-features.html#slotted-selectors), [`:global()`](https://vuejs.org/api/sfc-css-features.html#scoped-css) and [`v-bind`](https://vuejs.org/api/sfc-css-features.html#v-bind-in-css).

- Supports `@dark` & `@light` helpers

  <details>
  <summary>💡 Example</summary>
  <br>
  
  ```vue
  <style lang="ts">
  css({
    '.block': {
      color: 'black',
      backgroundColor: 'white',
      '@light': {
        color: 'grey'
      },
      '@dark': {
        backgroundColor: 'black'
      }
    }
  })
  </style>
  ```

  </details>

- Supports [`@nuxtjs/color-mode`](https://color-mode.nuxtjs.org)

  <details>
  <summary>💡 Example</summary>
  <br>
  
  ```vue
  <style lang="ts">
  css({
    '@sepia': {
      color: 'black'
    }
  })
  </style>
  ```

  This has same API as `@dark` or `@light`, but uses color modes defined in [`@nuxtjs/color-mode`](https://color-mode.nuxtjs.org)
  </details>

- Supports `@mq` helper

  <details>
  <summary>💡 Example</summary>
  <br>

  - Configuration

  ```ts
  import { defineTheme } from 'pinceau'

  export default defineTheme({
    media: {
      'sm': { value: '(min-width: 640px)' },
      'md': { value: '(min-width: 768px)' },
      'lg': { value: '(min-width: 1024px)' },
      'xl': { value: '(min-width: 1280px)' },
      '2xl': { value: '(min-width: 1536px)' },
      'rm': { value: '(prefers-reduced-motion: reduce)' },
    },
  })
  ```
  
  - Component

  ```vue
  <style lang="ts">
  css({
    '.block': {
      width: '100%'
      '@mq.lg': {
        width: '50%'
      },
    }
  })
  </style>

  <style lang="postcss">
  .block {
    width: 100%;

    @mq.lg {
      width: 50%;
    }
  }
  </style>
  ```

  You can add as many screen you need, they will all get autocompleted.
  </details>


- Supports `rgba()` conversions
  <details>
  <summary>💡 Example</summary>
  <br>

  ```vue
  <style lang="ts">
  css({
    '.block': {
      backgroundColor: 'rgba({any.color.token.path}, 0.8)'
    }
  })
  </style>
  ```

  </details>

- Supports `computed styles` **`💡 new`**

  <details>
  <summary>💡 Example</summary>
  <br>

  This syntax only works with `<script setup lang="ts">` for now.

  It is planned to support all `<script>` syntaxes soon.

  ```vue
  <script setup lang="ts">
  import type { PropType } from 'vue'
  // You must specify a key for props when using Variants
  const props = defineProps({
    color: {
      type: String as PropType<ThemeKey<'color'>>
    }
  })
  </script>
  
  <template>
    <div class="block" />
  </template>

  <style lang="ts">
  css({
    '.block': {
      backgroundColor: (props) => `{colors.${props.color}`,
    }
  })
  </style>
  ```

  </details>

- Supports `variants` system **`💡 new`**

  <details>
  <summary>💡 Example</summary>
  <br>

  This syntax only works with `<script setup lang="ts">` for now.

  It is planned to support all `<script>` syntaxes soon.

  Define your component variants at root of `css()`:

  ```vue
  <script setup lang="ts">
  // You must specify a key for props when using Variants
  const props = defineProps({
    // This part is optional, it provides typings
    ...variantsProps
  })
  </script>
  
  <template>
    <div class="block" />
  </template>

  <style lang="ts">
  css({
    '.block': {
      backgroundColor: 'rgba({colors.primary.500}, 0.8)',
    },
    variants: {
      transparent: {
        true: {
          backgroundColor: 'transparent'
        },
        options: {
          default: true
        }
      },
      shadows: {
        soft: {
          boxShadow: '{shadows.sm}'
        },
        smooth: {
          boxShadow: '{shadows.lg}',
          border: '2px solid {colors.primary.500}'
        },
        heavy: {
          boxShadow: '{shadows.xl}',
          border: '4px solid {colors.primary.800}'
        },
        options: {
          default: {
            sm: 'soft',
            lg: 'smooth',
            xl: 'heavy'
          }
        }
      }
    }
  })
  </style>
  ```

  Profit from automatically generated props and typings, and compatibility with all your media queries:

  ```vue
  <template>
    <Block :transparent="{ md: true, xl: false }" shadow="{ sm: 'soft', xl: 'smooth' }" />
  </template>
  ```

  </details>

### `$dt()`

`$dt` stands for __`$designToken`__.

In addition to `css()`, `$dt()` comes with everything you need to use your Design Tokens outside of `<style>`.

```vue
<script setup>
defineProps({
  color: {
    type: String,
    required: false,
    default: $dt('colors.primary')
  }
})

const orangeVariable = $dt('colors.orange.500')
</script>

<template>
  <div :style="{ backgroundColor: color }">
    {{ $dt('colors.primary') }}
  </div>
</template>

<style lang="postcss">
div {
  color: $dt('colors.orange.900')
}
</style>
```

`$dt()` helper will autocomplete all theme keys anywhere in your app.

### Options

`$dt()` supports options as a second argument, allowing you not only to grab CSS variables from your token, but the whole definition from a token, or a tree of token.

```ts
/**
 * The key that will be unwrapped from the design token object.
 * 
 * Supports `nested.key.syntax`.
 * 
 * Can be set to `undefined` to return the whole design token object.
 * 
 * @default 'attributes.variable'
 */
key?: string
/**
 * Toggle deep flattening of the design token object to the requested key.
 *
 * If you query an token path containing mutliple design tokens and want a flat \`key: value\` object.
 * 
 * @default false
 */
flatten?: boolean
```

```ts
const allColors = $dt('colors', { flatten: false, key: undefined })
const orangeColor = $dt('colors.orange', { key: undefined })
```

This is considered as advanced usage and these options might be subject to changes.

Accessing CSS variables via `$dt('token.path')` should stay the same.

#### 🚨 Warning

Please note that `$dt()` acts as a macro, like `defineProps` or `defineEmits`.

It will be replaced when your component gets transformed by Vite by the static value of the token.

That means the only valid value for `$dt()` is a plain string, not a reference to a string.

```vue
<script setup>
const test = $dt('colors.primary.500') // ✅ Valid

const ref = ref('colors.primary.500')
const refTest = $dt(ref.value) // 🚨 Invalid
</script>
```

## 🚀 More to come

Pinceau is currently in ⚡️ active ⚡️ development.

There is plenty of features to come, including:

- Proper test suite
  - Configuration side relies on [style-dictionary-esm](https://github.com/Tahul/style-dictionary-esm) which is heavily tested
  - `css()` core API relies on [`@stitches/stringify`] which also has tests, as this package maintains local implementation of it, I'll add some more tests to it.
  - All CSS transforms applied on `.vue` components are built with testing in mind

- Util properties
  <details>
  <summary>💡 Example</summary>

  ```ts
  // Theme config
  defineTheme({
    colors: {
      primary: {
        light: {
          value: '#B6465F'
        },
        dark: {
          value: '#4D1C26'
        }
      }
    },
    utils: {
      surface: (value: ThemeKeys<'colors'>) => ({
        backgroundColor: `{colors.${value}.dark}`,
        borderColor: `{colors.${value}.light}`
      })
    }
  })

  // Component <style lang="ts">
  css({
    surface: 'primary'
  })
  ```

    </details>

- Configuring your own [transforms](https://amzn.github.io/style-dictionary/#/transforms), [formats](https://amzn.github.io/style-dictionary/#/formats) and [actions](https://amzn.github.io/style-dictionary/#/actions)

- 🌐 Documentation website

- 🎨 Online playground

- Maybe [yours](https://github.com/Tahul/pinceau/issues)? I'm happy to provide guidance and reviews on any PR!

- And even more! 🚀

## 💖 Credits

- [Sébastien Chopin](https://github.com/Atinux)
- [NuxtLabs](https://github.com/nuxtlabs)
- [Daniel Roe](https://github.com/danielroe)
- [Anthony Fu](https://github.com/antfu)
- [Johnson Chu](https://github.com/johnsoncodehk)
- [@patak](https://github.com/patak-dev)
- [Serhii Bedrytskyi](https://github.com/bdrtsky)
- [The Stitches Team](https://stitches.dev)
  - [Pedro Duarte](https://twitter.com/peduarte)
  - [Jonathan Neal](https://twitter.com/jon_neal)
  - [Abdulhadi Alhallak](https://twitter.com/hadi_hlk)

This package takes inspiration in a lot of other projects, such as [style-dictionary](https://github.com/amzn/style-dictionary), [Stitches](https://stitches.dev), [vanilla-extract](https://vanilla-extract.style/), [unocss](https://github.com/unocss/unocss).

## License

[MIT](./LICENSE) License &copy; 2022-PRESENT [Yaël GUILLOUX](https://github.com/Tahul)

---

> _“All you need to paint is a few tools, a little instruction, and a vision in your mind.”_ • Bob Ross
