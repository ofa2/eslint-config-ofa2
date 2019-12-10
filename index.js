module.exports = {
  extends: [
    'prettier',
    'prettier/@typescript-eslint',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: [],
  globals: {},
  rules: {
    'brace-style': 'off',
    '@typescript-eslint/brace-style': ['error'],

    camelcase: 'off',
    '@typescript-eslint/camelcase': ['error', { properties: 'always' }],

    'func-call-spacing': 'off',
    '@typescript-eslint/func-call-spacing': ['error'],

    indent: 'off',
    '@typescript-eslint/indent': ['error', 2],

    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'error',

    'no-extra-parens': 'off',
    '@typescript-eslint/no-extra-parens': ['error'],

    'no-magic-numbers': 'off',
    '@typescript-eslint/no-magic-numbers': [
      'error',
      { ignoreNumericLiteralTypes: true }
    ],

    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': ['error'],

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false
      }
    ],

    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',

    quotes: 'off',
    '@typescript-eslint/quotes': ['error'],

    'require-await': 'off',
    '@typescript-eslint/require-await': 'error',

    semi: 'off',
    '@typescript-eslint/semi': ['error'],

    'space-before-function-paren': 'off',
    '@typescript-eslint/space-before-function-paren': ['error'],

    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/explicit-member-accessibility': [
      { overrides: { constructors: 'no-public' } }
    ],
    '@typescript-eslint/no-explicit-any': ['off']
  }
};
