module.exports = {
  '@typescript-eslint/explicit-function-return-type': ['off'],
  '@typescript-eslint/explicit-member-accessibility': [
    'error',
    { overrides: { constructors: 'no-public' } },
  ],
  '@typescript-eslint/no-explicit-any': ['off'],
};
