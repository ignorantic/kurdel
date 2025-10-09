module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'vitest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: [
      './tsconfig.json',
      './packages/*/tsconfig.eslint.json',
      './sample/*/tsconfig.eslint.json'
    ],
    tsconfigRootDir: __dirname,
  },
  env: {
    es2021: true,
    node: true,
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.test.ts'],
      env: { 'jest': true },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: [
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/tests/**/*.ts',
        '**/*.config.ts',
      ],
      parserOptions: { project: null },
      env: { jest: true },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
  ignorePatterns: [
    'lib/',
    'dist/',
    'node_modules/',
    '.cache/',
    'coverage/',
    '*.config.js',
    '*.config.cjs',
  ],
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // General
    'no-console': 'off',
    'prefer-const': 'error',
  },
};
