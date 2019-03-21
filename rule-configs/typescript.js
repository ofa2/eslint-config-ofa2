module.exports = {
  extends: ['./index.js', 'plugin:@typescript-eslint/recommended'],
  settings: {
    'import/resolver': {
      node: { extensions: ['.ts'] },
    },
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-member-accessibility': ['off'],
    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/interface-name-prefix': ['error', 'always'],
    '@typescript-eslint/no-explicit-any': ['off'],
  },
};
