import antfu from '@antfu/eslint-config'

export default antfu(
  {
    rules: {
      'yaml/no-empty-document': 'off',
      'curly': ['error', 'multi-line', 'consistent'],
      'quotes': ['error', 'single'],
      'ts/ban-ts-comment': 'off',
      'style/max-statements-per-line': 'off',
      'import/order': 'warn',
      'ts/prefer-ts-expect-error': 'off',
      'no-console': 'off',
      'ts/ban-types': 'off',
      'vue/one-component-per-file': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'ts/no-namespace': 'off',
      'new-cap': 'off',
    },
  },
  {
    ignores: [
      'README.md',
      'tests/tmp/svelte-plugin.js',
      '**/*.md',
      '**/examples/**',
      '**/package.json',
      'packages/palette/output/',
      '**/tests/fixtures/',
      '**/tests/tmp/',
      '.vscode',
      '**/grammars/*.tmLanguage.js',
    ],
  },
)
