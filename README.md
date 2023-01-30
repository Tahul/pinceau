![Pinceau Cover](./docs/public/cover.png)

---

# Pinceau

[![NPM version](https://img.shields.io/npm/v/pinceau?color=a1b858&label=)](https://www.npmjs.com/package/pinceau)

> Makes your `<script>` lighter and your `<style>` smarter.

[🎨 Start painting](https://stackblitz.com/github/Tahul/vitesse-pinceau?file=src%2FApp.vue) • [🧑‍🎨 Documentation](https://pinceau.dev)

- Ships 0b of JavaScript to the client by default
- [Design Tokens](https://github.com/design-tokens/community-group) compatible configuration system
- **Fully-typed** styling API
- Developer Experience that feels like a native [Vue](https://vuejs.org) feature
- Plug & play with [Nuxt 3](https://v3.nuxtjs.org) and [Vite](https://vitejs.org)
- Used by [@nuxt-themes](https://github.com/nuxt-themes) ecosystem
- Ready for [Nuxt Studio](https://nuxt.studio)
- [Pinceau VSCode extension](https://marketplace.visualstudio.com/items?itemName=yaelguilloux.pinceau-vscode) for value hints
- Integrated with [Volar](https://github.com/volarjs/volar.js)

#### 🚨 Warning

> Pinceau is still under heavy development, if you are missing some parts of the documentation, please [open an issue](https://github.com/Tahul/pinceau) and describe your problem.
> I'll be happy to help.

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

Learn more about Pinceau on the [documentation](https://pinceau.dev/get-started/what-is-pinceau).

## 💖 Credits

Thanks to these amazing people that helped me along the way:

- [Sébastien Chopin](https://github.com/Atinux)
- [NuxtLabs](https://github.com/nuxtlabs)
- [Daniel Roe](https://github.com/danielroe)
- [Anthony Fu](https://github.com/antfu)
- [Johnson Chu](https://github.com/johnsoncodehk)
- [@patak](https://github.com/patak-dev)
- [Serhii Bedrytskyi](https://github.com/bdrtsky)

This package takes a lot of inspiration in these amazing projects:

- [Stitches](https://stitches.dev)
- [vanilla-extract](https://vanilla-extract.style/)
- [unocss](https://github.com/unocss/unocss)
- [style-dictionary](https://github.com/amzn/style-dictionary)

## License

[MIT](./LICENSE) License &copy; 2022-PRESENT [Yaël GUILLOUX](https://github.com/Tahul)

---

> _“All you need to paint is a few tools, a little instruction, and a vision in your mind.”_ • Bob Ross
