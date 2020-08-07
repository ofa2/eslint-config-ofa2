const got = require('got');
const { writeFile, ensureDir, emptyDir, writeJSON } = require('fs-extra');
const { resolve: pathResolve } = require('path');
const prettier = require('prettier');
const airbnbBase = require('eslint-config-airbnb-base');
const { parse: json5parse } = require('json5');
const { pick, assign } = require('lodash');
const debug = require('debug')('eslint-config');

const overrides = require('./overrides');
const pkg = require('../package.json');

const ruleBaseHref =
  'https://raw.githubusercontent.com/typescript-eslint/typescript-eslint/master/packages/eslint-plugin/docs/rules/';
const indexUrl =
  'https://raw.githubusercontent.com/typescript-eslint/typescript-eslint/master/packages/eslint-plugin/README.md';

function json2lines(obj) {
  return JSON.stringify(obj).replace(/^{|}$/g, '');
}

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

  const { body } = await got(url, { encoding: 'utf8' });
  return body;
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

function getDisableBaseRule(details) {
  const airbnb = parseAirbnbBase();

  return details
    .map((content) => {
      if (
        /```(jsonc|cjson)[\r\n]{[^{}]*?note you must disable the base rule as it can report incorrect errors([\d\D]*?)}\s*[\r\n]```/.test(
          content
        )
      ) {
        return RegExp.$2;
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
        [baseRuleName]: ['off'],
        [tsRuleName]: airbnb[baseRuleName],
      };
    })
    .filter((item) => {
      return !!item;
    })
    .reduce((result, current) => {
      assign(result, current);
      return result;
    }, {});
}

async function buildEslintrc(disableBaseRule) {
  const str = `
  module.exports = {
    extends: [
      'plugin:@typescript-eslint/recommended',
      'prettier/@typescript-eslint',
      'airbnb-base',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
      'plugin:prettier/recommended',
    ],
    rules: {
      'prettier/prettier': [
        'error',
        {
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: true,
          trailingComma: 'es5',
          bracketSpacing: true,
          jsxBracketSameLine: false,
          arrowParens: 'always',
          requirePragma: false,
          insertPragma: false,
        },
      ],
      ${json2lines(assign({}, disableBaseRule, overrides))}
    },
  };
  `;

  const distDir = pathResolve(__dirname, '../dist/');
  await emptyDir(distDir);

  await ensureDir(distDir);

  const filePath = pathResolve(distDir, `./index.js`);
  const content = prettier.format(str, { singleQuote: true, parser: 'babel' });
  await writeFile(filePath, content);

  await writeJSON(
    pathResolve(distDir, 'package.json'),
    pick(pkg, [
      'name',
      'version',
      'description',
      'main',
      'author',
      'license',
      'peerDependencies',
      'publishConfig',
    ]),
    {
      spaces: 2,
    }
  );
}

(async () => {
  debug('requesting rules');
  const rules = await queryRules();
  debug('rules length: ', rules.length);

  const details = await Promise.all(
    rules.map((rulePath) => {
      return getRuleDetail(rulePath);
    })
  );

  const obj = getDisableBaseRule(details);
  debug('builing Eslintrc');

  await buildEslintrc(obj);

  debug('sucess');
})().catch((e) => {
  console.warn(e);
});
