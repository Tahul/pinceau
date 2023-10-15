import { wireTmGrammars } from 'monaco-editor-textmate'
import { Registry } from 'monaco-textmate'

async function dispatchGrammars(scopeName) {
  switch (scopeName) {
    case 'source.svelte':
      return {
        format: 'json',
        content: await import('./grammars/svelte.tmLanguage.js'),
      }
    case 'source.jsx':
      return {
        format: 'json',
        content: await import('./grammars/TypescriptReact.tmLanguage.js'),
      }
    case 'source.tsx':
      return {
        format: 'json',
        content: await import('./grammars/TypescriptReact.tmLanguage.js'),
      }
    case 'source.vue':
      return {
        format: 'json',
        content: await import('./grammars/vue.tmLanguage.js'),
      }
    case 'source.ts':
      return {
        format: 'json',
        content: await import('./grammars/TypeScript.tmLanguage.js'),
      }
    case 'source.js':
      return {
        format: 'json',
        content: await import('./grammars/JavaScript.tmLanguage.js'),
      }
    case 'text.html.basic':
      return {
        format: 'json',
        content: await import('./grammars/html.tmLanguage.js'),
      }
    case 'source.css':
      return {
        format: 'json',
        content: await import('./grammars/css.tmLanguage.js'),
      }
    default:
      return {
        format: 'json',
        content: {
          scopeName: 'source',
          patterns: [],
        },
      }
  }
}

async function loadGrammars(monaco, editor) {
  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      const dispatch = await dispatchGrammars(scopeName)
      return JSON.parse(JSON.stringify(dispatch))
    },
  })
  const grammars = new Map()
  grammars.set('svelte', 'source.svelte')
  grammars.set('vue', 'source.vue')
  grammars.set('javascript', 'source.js')
  grammars.set('typescript', 'source.ts')
  grammars.set('css', 'source.css')
  grammars.set('html', 'text.html.basic')
  grammars.set('jsx', 'source.jsx')
  grammars.set('tsx', 'source.tsx')
  for (const lang of grammars.keys()) {
    monaco.languages.register({
      id: lang,
    })
  }
  await wireTmGrammars(monaco, registry, grammars, editor)
}

export {
  loadGrammars,
}
