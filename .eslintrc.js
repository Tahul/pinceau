/* eslint-env node */

// require('@rushstack/eslint-patch/modern-module-resolution')

const { createComponentMetaChecker } = require('vue-component-meta')
const tsConfig = require.resolve('./tsconfig.json')
const checker = createComponentMetaChecker(tsConfig)
const program = checker.__internal__.tsLs.getProgram()

/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    '@antfu',
  ],
  ignorePatterns: '**/*.md,test/fixtures/**/*.vue,package.json',
  rules: {
    curly: ['error', 'multi-line', 'consistent'],
    quotes: ['off', 'single'],
    'quote-props': ['off'],
    '@typescript-eslint/ban-ts-comment': 'off',
    'antfu/generic-spacing': 'off',
    'max-statements-per-line': 'off',
    '@typescript-eslint/prefer-ts-expect-error': 'off',
    'no-console': 'off',
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
    programs: [program],
  },
}
