// 执行代码 node -r ts-node/register src/let_to_var.ts
// chrome调试代码 node -r ts-node/register --inspect-brk src/let_to_var.ts
import { parse } from '@babel/parser';
import generator from '@babel/generator';
import traverse from '@babel/traverse';

const code = `let a = 'let'; let b = 2`;
const ast = parse(code, { sourceType: 'module' });
console.log(ast);
