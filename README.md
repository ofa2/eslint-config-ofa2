# ofa2 eslint config

## V3 版本

[eslint-config-ofa2/tree/v3](https://github.com/ofa2/eslint-config-ofa2/tree/v3)

## `npm install`

```bash
npx install-peerdeps --dev @ofa2/eslint-config
```

## config `.eslintrc.js`

```js
module.exports = {
  extends: ['@ofa2/eslint-config'],
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  globals: {},
  rules: {},
};
```
