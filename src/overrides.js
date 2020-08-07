module.exports = {
  'import/extensions': ['error', 'never'],
  'import/prefer-default-export': ['off'],
  'no-dupe-class-members': ['off'],

  '@typescript-eslint/explicit-function-return-type': ['off'],
  '@typescript-eslint/explicit-member-accessibility': [
    'error',
    { overrides: { constructors: 'no-public' } },
  ],
  '@typescript-eslint/explicit-module-boundary-types': [
    'error',
    {
      allowArgumentsExplicitlyTypedAsAny: true,
    },
  ],
  '@typescript-eslint/indent': ['off'],
  '@typescript-eslint/no-explicit-any': ['off'],
};
