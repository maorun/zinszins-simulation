import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import stylistic from '@stylistic/eslint-plugin'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    ignores: ['dist/**', 'build/**', 'public/build/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@stylistic': stylistic,
    },
    rules: {
      ...stylistic.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'no-unused-vars': 'off', // Turn off base rule for TypeScript files
      'no-redeclare': 'off', // Turn off for function overloads
      // Stylistic rules with custom configuration
      '@stylistic/max-len': ['error', { 
        code: 120, // User requested max-len of 120
        ignoreUrls: true,
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/multiline-ternary': 'off', // Disable to avoid excessive refactoring

      // Code Quality Rules (Codacy best practices)
      'complexity': ['warn', 8], // Cyclomatic complexity - Phase 4.3: 8 (final target)
      'max-depth': ['warn', 5], // Maximum nesting depth
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }], // Phase 4.3: 50 (final target)
      
      // Security Rules (Codacy security patterns)
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      
      // Best Practices (Codacy recommendations)
      'no-debugger': 'error',
      'no-alert': 'warn',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-throw-literal': 'error',
      'no-duplicate-imports': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'warn',
      
      // TypeScript-specific rules (Codacy TypeScript patterns) - only rules that don't require type info
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
      '@typescript-eslint/consistent-type-assertions': 'warn',
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-inferrable-types': 'warn',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'react-refresh/only-export-components': 'off',
      // Relax code quality rules for test files
      'max-lines-per-function': 'off',
      'max-nested-callbacks': 'off',
      'complexity': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off', // Allow console in tests for debugging
    },
  },
  // Prettier integration - must be last to override conflicting rules
  prettierConfig,
]