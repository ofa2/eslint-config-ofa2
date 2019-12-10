const got = require('got');
const { writeFile, access, ensureFile, ensureDir, readFile, copy, emptyDir } = require('fs-extra');
const { resolve: pathResolve } = require('path');
const prettier = require('prettier');
const airbnbBase = require('eslint-config-airbnb-base');
const { parse: json5parse } = require('json5');

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
    .map((item) => {
      const obj = json5parse(`{${item}}`);
      return Object.entries(obj);
    })
    .map(([[baseRuleName], [tsRuleName]]) => {
      // eslint core 的规则 要使用 ts的规则 替换
      if (!airbnb[baseRuleName]) {
        return undefined;
      }

      // 原来配置是什么, ts就复制配置
      return {
        [baseRuleName]: 'off',
        [tsRuleName]: airbnb[baseRuleName],
      };
    })
    .filter((item) => {
      return !!item;
    })
    .map((item) => {
      return JSON.stringify(item).replace(/^{|}$/g, '');
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

  const distDir = pathResolve(__dirname, '../dist/');
  await emptyDir(distDir);

  await ensureDir(distDir);

  const filePath = pathResolve(distDir, `./index.js`);
  await writeFile(filePath, prettier.format(str, { singleQuote: true, parser: 'babel' }));

  await Promise.all([
    copy(pathResolve(__dirname, `../package.json`), pathResolve(distDir, `./package.json`)),
    copy(
      pathResolve(__dirname, `../package-lock.json`),
      pathResolve(distDir, `./package-lock.json`)
    ),
  ]);
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
})().catch((e) => {
  console.warn(e);
});
