![Pinceau Cover](./docs/public/cover.jpg)

# Pinceau

[![NPM version](https://img.shields.io/npm/v/pinceau?color=a1b858&label=)](https://www.npmjs.com/package/pinceau)

> Make your `<script>` lighter and your `<style>` smarter.

[🎨 play.pinceau.dev](https://play.pinceau.dev) • [🧑‍🎨 Documentation](https://pinceau.dev)

- Ships **0kb** of JavaScript to the client
- [Design tokens](https://github.com/design-tokens/community-group) compatible configuration
- **Fully-typed** styling API
- **Opt-in** runtime engine
- Developer Experience that feels like a native [Vue](https://vuejs.org) feature
- Plug & play with [Nuxt 3](https://v3.nuxtjs.org) and [Vite](https://vitejs.org)
- Ready for [Nuxt Studio](https://nuxt.studio)
- [Pinceau VSCode extension](https://marketplace.visualstudio.com/items?itemName=yaelguilloux.pinceau-vscode) for **DX Sugar**

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

Example: [`playground/`](./playground/nuxt.config.ts)

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

Example: [`playground/_vite.config.ts`](./playground/_vite.config.ts)

</details>

<details>
<summary>Create your theme</summary><br>

```ts
// tokens.config.ts
import { defineTheme } from 'pinceau'

export default defineTheme({
  // Media queries
  media: {
    mobile: '(min-width: 320px)',
    tablet: '(min-width: 768px)',
    desktop: '(min-width: 1280px)'
  },


  // Some Design tokens
  color: {
    red: {
      1: '#FCDFDA',
      2: '#F48E7C',
      3: '#ED4D31',
      4: '#A0240E',
      5: '#390D05',
    },
    green: {
      1: '#CDF4E5',
      2: '#9AE9CB',
      3: '#36D397',
      4: '#1B7D58',
      5: '#072117',
    }
  },
  space: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem'
  }

  // Utils properties
  utils: {
    px: (value: PropertyValue<'padding'>) => ({ paddingLeft: value, paddingRight: value }),
    py: (value: PropertyValue<'padding'>) => ({ paddingTop: value, paddingBottom: value })
  }
})
```

Example: [`playground/theme/tokens.config.ts`](./playground/theme/tokens.config.ts)

</details>

Learn more about Pinceau in the [documentation](https://pinceau.dev/get-started/what-is-pinceau)].

## 💖 Credits

Thanks to these amazing people that helped me along the way:

- [Sébastien Chopin](https://github.com/Atinux)
- [NuxtLabs](https://github.com/nuxtlabs)
- [Daniel Roe](https://github.com/danielroe)
- [Anthony Fu](https://github.com/antfu)
- [Johnson Chu](https://github.com/johnsoncodehk)
- [@patak](https://github.com/patak-dev)
- [Serhii Bedrytskyi](https://github.com/bdrtsky)

This package takes a lot of inspiration from these amazing projects:

- [Stitches](https://stitches.dev)
- [vanilla-extract](https://vanilla-extract.style/)
- [unocss](https://github.com/unocss/unocss)
- [style-dictionary](https://github.com/amzn/style-dictionary)

## License

[MIT](./LICENSE) License &copy; 2022-PRESENT [Yaël GUILLOUX](https://github.com/Tahul)

---

> _“All you need to paint is a few tools, a little instruction, and a vision in your mind.”_ • Bob Ross
