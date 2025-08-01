import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import sonarjs from 'eslint-plugin-sonarjs'
import prettierConfig from 'eslint-config-prettier'

export default [
  // Base configurations
  js.configs.recommended,
  prettierConfig,
  
  // TypeScript specific configuration
  {
    files: ['src/**/*.ts', 'examples/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'sonarjs': sonarjs
    },
    rules: {
      // Base JavaScript rules
      'semi': ['error', 'never'],
      'quotes': ['error', 'single'],
      'indent': 'off',
      'comma-dangle': ['error', 'never'],

      // Coding style rules
      'no-inline-comments': 'error',
      'curly': ['error', 'all'],

      // Best practices matching your code
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'prefer-destructuring': ['error', {
        array: false,
        object: true
      }],

      // Error prevention
      'no-console': 'off',
      'no-unused-expressions': 'error',
      'no-extra-parens': ['error', 'all', { 
        'conditionalAssign': false,
        'returnAssign': false,
        'nestedBinaryExpressions': false,
        'ignoreJSX': 'all'
      }],
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'error',
      'no-empty-function': 'error',
      'no-extra-boolean-cast': 'error',
      'no-extra-semi': 'off',
      'no-func-assign': 'error',
      'no-inner-declarations': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-obj-calls': 'error',
      'no-sparse-arrays': 'error',
      'no-unexpected-multiline': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
      'no-control-regex': 'off',
      
      // TypeScript rules
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // SonarJS rules for code duplication detection
      'sonarjs/no-duplicate-string': 'error',
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/no-one-iteration-loop': 'error',
      'sonarjs/no-use-of-empty-return-value': 'error'
    }
  },
  
  // Example files - more relaxed rules
  {
    files: ['examples/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'off',
      'sonarjs/no-duplicate-string': 'off'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'data/**',
      'docs/**',
      '*.config.js'
    ]
  }
]