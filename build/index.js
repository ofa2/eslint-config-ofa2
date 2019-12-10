const got = require('got');
const { writeFile, access, ensureFile, readFile } = require('fs-extra');
const { resolve: pathResolve } = require('path');
const prettier = require('prettier');
const airbnbBase = require('eslint-config-airbnb-base');

const overrides = require('./overrides');

const ruleBaseHref =
  'https://raw.githubusercontent.com/typescript-eslint/typescript-eslint/master/packages/eslint-plugin/docs/rules/';
const indexUrl =
  'https://raw.githubusercontent.com/typescript-eslint/typescript-eslint/master/packages/eslint-plugin/README.md';

async function queryRules() {
  const { body } = await got(indexUrl, { encoding: 'utf8' });

  const arr = body.match(/\.\/docs\/rules\/.*?\.md/g);

  if (!arr) {
    return;
  }

  return arr.map((item) => {
    return item.replace(/\.\/docs\/rules\/(.*?)\.md/, '$1');
  });
}

function getUrl(rule) {
  return ruleBaseHref + rule + '.md';
}

async function getRuleDetail(rule) {
  const url = getUrl(rule);
  const filePath = pathResolve(__dirname, `./rules/${rule}.md`);

  try {
    await access(filePath);
    return readFile(filePath, { encoding: 'utf8' });
  } catch (e) {
    console.info('write', rule);
    await ensureFile(filePath);
    const { body } = await got(url, { encoding: 'utf8' });
    await writeFile(filePath, body);

    return body;
  }
}

function parseAirbnbBase() {
  return airbnbBase.extends
    .map((path) => {
      return require(path);
    })
    .map((item) => {
      return item && item.rules;
    })
    .filter((item) => {
      return !!item;
    })
    .reduce((result, item) => {
      result = { ...result, ...item };
      return result;
    }, {});
}

function getDisableBaseRuleContent(details) {
  const airbnb = parseAirbnbBase();

  return details
    .map((content) => {
      if (
        /{[^{}]*?note you must disable the base rule as it can report incorrect errors([\d\D]*?)}\s*[\r\n]/.test(
          content
        )
      ) {
        return RegExp.$1;
      }

      return undefined;
    })
    .filter((item) => {
      return !!item;
    })
    .map((item) => {
      return item.trim();
    })
    .filter((item) => {
      // 规则在airbnb中开启了, 需要关闭
      const ruleName = item
        .split(/[\r\n]/)[0]
        .split(/:/)[0]
        .trim()
        .replace(/^"|"$/g, '');

      return !!airbnb[ruleName];
    })
    .map((item) => {
      return item.replace(/,$/, '');
    })
    .join(',\n\n');
}

async function buildEslintrc(disableBaseRuleContent) {
  const str = `
  module.exports = {
    extends: [
      'prettier',
      'prettier/@typescript-eslint',
      'airbnb-base',
      'plugin:@typescript-eslint/recommended',
    ],
    plugins: [],
    globals: {},
    rules: {
      ${disableBaseRuleContent},

      
      ${JSON.stringify(overrides).replace(/^{|}$/g, '')}
    },
  };
  `;

  const filePath = pathResolve(__dirname, `../index.js`);
  await ensureFile(filePath);

  await writeFile(filePath, prettier.format(str, { singleQuote: true, parser: 'babel' }));
}

(async () => {
  const rules = await queryRules();

  const details = await Promise.all(
    rules.map((rulePath) => {
      return getRuleDetail(rulePath);
    })
  );

  const str = getDisableBaseRuleContent(details);

  await buildEslintrc(str);
})();
