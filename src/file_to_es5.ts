import { parse } from '@babel/parser';
import * as babel from '@babel/core';
import * as fs from 'fs';

const code = fs.readFileSync('src/test.js', { encoding: 'utf-8' });
const ast = parse(code, { sourceType: 'module' });
const result = babel.transformFromAstSync(ast, code, {
  presets: ['@babel/preset-env'],
});
fs.writeFileSync('src/test.es5.js', result?.code || '');
