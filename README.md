# 🖌 pinceau

[![NPM version](https://img.shields.io/npm/v/pinceau?color=a1b858&label=)](https://www.npmjs.com/package/pinceau)

[✨ Documentation](#documentation) • [🎨 Start painting]()

A _CSS-in-JS_ framework built to feel like a native Vue feature.

- Ships **0kb** of **JS** to the client
- **DX** that feels like a native Vue feature
- [Design Tokens](https://github.com/design-tokens/community-group) compatible configuration system
- Fully-typed styling API inspired from [Stitches](https://www.npmjs.com/package/@stitches/stringify)
- Integrated with [Volar](https://github.com/johnsoncodehk/volar)
- First-class support for [Nuxt 3](https://v3.nuxtjs.org), [Vitesse](https://github.com/antfu/vitesse), [@vitejs/plugin-vue](https://github.com/vitejs/vite/tree/main/packages/plugin-vue)

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
    /* options */
  }
})
```

> This module only works with [Nuxt 3](https://v3.nuxtjs.org).

<br></details>

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import Pinceau from 'pinceau/vite'

export default defineConfig({
  plugins: [
    Pinceau({ /* options */ }),
  ],
})
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import Pinceau from 'pinceau/rollup'

export default {
  plugins: [
    Pinceau({ /* options */ }),
  ],
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import Pinceau from 'pinceau/esbuild'

build({
  plugins: [Pinceau({ /* options */ })],
})
```

<br></details>

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

## 🖌 Paint

Pinceau styling API is made to feel like a native Vue API.

To do so, it fully takes advantages of the Vue components `<style>` tags, and tries to give it even more super powers.

### `css()`

Pinceau enables `lang="ts"` as a valid attribute for `<style>` or `<style scoped>` tags.

That enables the usage of another internal API, `css()`.

```
<style lang="ts">
css({
  color: '{colors.primary}'
})
</style>
```

The `css()` function has mutliple features:

- Based on [`@stitches/stringify`](https://www.npmjs.com/package/@stitches/stringify)

- Autocomplete CSS properties from [`csstype`](https://github.com/frenic/csstype)

- Autocomplete CSS values from theme design tokens

  <details>
  <summary>Example</summary>
  <br>
  
  ```
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
  <summary>Example</summary>
  <br>
  
  ```
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
  <summary>Example</summary>
  <br>
  
  ```
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
  <summary>Example</summary>
  <br>
  
  ```
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
  <summary>Example</summary>
  <br>
  
  ```
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
  <summary>Example</summary>
  <br>
  
  ```
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
  <summary>Example</summary>
  <br>
  
  ```
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

- Supports `@screen` helper

  <details>
  <summary>Example</summary>
  <br>

  - Configuration

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
  })
  ```
  
  - Component

  ```
  <style lang="ts">
  css({
    '.block': {
      width: '100%'
      '@screen:lg': {
        width: '50%'
      },
    }
  })
  </style>
  ```
  </details>


- Supports `rgba()` conversions
  <details>
  <summary>Example</summary>
  <br>

  ```
  <style lang="ts">
  css({
    '.block': {
      backgroundColor: 'rgba({any.color.token.path}, 0.8)'
    }
  })
  </style>
  ```

  </details>

- Supports `variants`system **`🚨 wip`**

  <details>
  <summary>Example</summary>
  <br>

  ```
  <template>
  <div :class="['block', blockTransparent]" />
  </template>

  <script setup>
  defineProps({
    // This part is WIP (and fully optional)
    ...variantsProps('block')
  })
  </script>

  <style lang="ts">
  css({
    '.block': {
      backgroundColor: 'rgba({any.color.token.path}, 0.8)',
      variants: {
        transparent: {
          backgroundColor: 'transparent'
        }
      }
    }
  })
  </style>
  ```

  </details>


## 💖 Credits

- [Sébastien Chopin](https://github.com/Atinux)
- [NuxtLabs](https://github.com/nuxtlabs)
- [Daniel Roe](https://github.com/danielroe)
- [Anthony Fu](https://github.com/antfu)
- [Johnson Chu](https://github.com/johnsoncodehk)
- [The Stitches Team](https://stitches.dev)
  - [Pedro Duarte](https://twitter.com/peduarte)
  - [Jonathan Neal](https://twitter.com/jon_neal)
  - [Abdulhadi Alhallak](https://twitter.com/hadi_hlk)

## License

[MIT](./LICENSE) License &copy; 2022-PRESENT [Yaël GUILLOUX](https://github.com/Tahul)
