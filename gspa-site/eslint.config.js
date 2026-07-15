import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'public/_astro/**', 'public/legacy/**', 'work/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['src/**/*.{js,jsx,ts,tsx}'], languageOptions: { globals: globals.browser }, plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh }, rules: { ...reactHooks.configs.recommended.rules, 'react-hooks/purity': 'off', 'react-refresh/only-export-components': 'off', 'no-console': ['error', { allow: ['warn', 'error'] }], '@typescript-eslint/no-explicit-any': 'error', '@typescript-eslint/no-unused-expressions': 'off' } },
  { files: ['scripts/**/*.mjs', 'vite.config.js'], languageOptions: { globals: { ...globals.node, ...globals.browser } }, rules: { 'no-console': 'off' } },
  { files: ['src/scenes/**/*.{ts,tsx}', 'src/native/FaraScene.tsx'], rules: { 'react-hooks/immutability': 'off' } },
)
