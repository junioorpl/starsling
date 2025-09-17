import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',

      // Import rules - automatically remove unused imports
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
          js: 'never',
          jsx: 'never',
        },
      ],
      'import/prefer-default-export': 'off',
      'import/no-unused-modules': 'error',
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],

      // General rules
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off', // Use TypeScript version instead
      'no-duplicate-imports': 'error',
      'no-useless-rename': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'eol-last': 'error',
      'comma-dangle': 'off',
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'jsx-quotes': ['error', 'prefer-double'],
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'next-env.d.ts',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      'public/**',
      'coverage/**',
      '.eslintcache',
      '*.tsbuildinfo',
      'Dockerfile*',
      'docker-compose*.yml',
      '*.md',
      '*.log',
      '*.db',
      '*.sqlite*',
      'tmp/**',
      'temp/**',
      '.vscode/**',
      '.idea/**',
    ],
  },
];

export default eslintConfig;
