# 🖌 pinceau

[![NPM version](https://img.shields.io/npm/v/pinceau?color=a1b858&label=)](https://www.npmjs.com/package/pinceau)

[✨ Documentation]() • [🎨 Start painting]()

A CSS-in-JS framework built to feel like a native Vue feature.

- Ships **0kb** of JS to the client
- **DX** that feels like a **native** Vue feature
- [Design Tokens](https://github.com/design-tokens/community-group)-compatible configuration system
- Fully-typed styling API inspired from [Stitches](https://www.npmjs.com/package/@stitches/stringify)
- Integrated with [Volar](https://github.com/johnsoncodehk/volar)
- First-class support for [Nuxt 3](https://v3.nuxtjs.org), [Vitesse](https://github.com/antfu/vitesse), [@vitejs/plugin-vue](https://github.com/vitejs/vite/tree/main/packages/plugin-vue)

## Install

```bash
npm i pinceau
```

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

# 💖 Credits

- [NuxtLabs](https://github.com/nuxtlabs)
- [Anthony Fu](https://github.com/antfu)
- [Johnson Chu](https://github.com/johnsoncodehk)
- [The Stitches Team](https://stitches.dev)
  - [Pedro Duarte](https://twitter.com/peduarte)
  - [Jonathan Neal](https://twitter.com/jon_neal)
  - [Abdulhadi Alhallak](https://twitter.com/hadi_hlk)

## License

[MIT](./LICENSE) License &copy; 2022-PRESENT [Yaël GUILLOUX](https://github.com/Tahul)
