module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { project: ['./tsconfig.json'] },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts'],
      },
    },
  },
  plugins: ['@typescript-eslint', 'unused-imports', 'import'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  overrides: [
    {
      files: ['*.ts'],
      extends: 'standard-with-typescript',
      rules: {
        'no-console': 'error',
        'promise/param-names': 'off',
        'no-tabs': 'off',
        'n/handle-callback-err': 'off',
        '@typescript-eslint/semi': 'off',
        '@typescript-eslint/comma-dangle': 'off',
        '@typescript-eslint/member-delimiter-style': 'off',
        '@typescript-eslint/consistent-type-imports': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-extraneous-class': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/consistent-type-assertions': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
        '@typescript-eslint/space-before-function-paren': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          {
            accessibility: 'explicit',
            overrides: {
              accessors: 'explicit',
              constructors: 'explicit',
              methods: 'explicit',
              properties: 'explicit',
              parameterProperties: 'explicit',
            },
          },
        ],
      },
    },
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/dot-notation': 'error',
        'no-shadow': 'off',
      },
    },
  ],
};
