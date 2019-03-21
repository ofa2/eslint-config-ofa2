# ofa2 eslint config

## Typescript rule

### ts `npm install`

```bash
npm install --save-dev eslint typescript eslint-config-airbnb-base eslint-plugin-import @ofa2/eslint-config @typescript-eslint/eslint-plugin
```

### ts config `.eslintrc.js`

```js
module.exports = {
  globals: {},
  extends: ['@ofa2/eslint-config'],
  rules: {},
};
```

## standard rule

### `npm install`

```bash
npm install --save-dev eslint eslint-config-airbnb-base eslint-plugin-import @ofa2/eslint-config
```

### config `.eslintrc.js`

```js
module.exports = {
  globals: {},
  extends: ['@ofa2/eslint-config/rule-configs/index'],
  rules: {},
};
```
