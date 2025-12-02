import * as path from 'path';
import * as fs from 'fs';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const projectRootDir = path.resolve(__dirname, './dependency_parsing_project');
type DepRelation = Record<string, { deps: string[]; code: string }>;
const depRelation: DepRelation = {};

const getProjectPath = (dir: string) => {
  return path.relative(projectRootDir, dir);
};

const collectCodeAndDeps = (entryDir: string) => {
  const code = fs.readFileSync(entryDir, { encoding: 'utf-8' });
  const entryProjectPath = getProjectPath(entryDir);
  depRelation[entryProjectPath] = { deps: [], code };
  const ast = parse(code, { sourceType: 'module' });
  traverse(ast, {
    enter: (item) => {
      if (item.node.type === 'ImportDeclaration') {
        const depDir = getProjectPath(
          path.resolve(path.dirname(entryDir), item.node.source.value)
        );
        depRelation[entryProjectPath].deps.push(depDir);
      }
    },
  });
};

collectCodeAndDeps(path.resolve(projectRootDir, './index.js'));

console.log('feng', depRelation);
