/** 递归收集嵌套依赖 */
import * as path from 'path';
import * as fs from 'fs';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

// 项目绝对路径
const projectRootDir = path.resolve(
  __dirname,
  './dependency_parsing_project_3'
);
// 声明依赖图的类型
type DepRelation = Record<string, { deps: string[]; code: string }>;
// 初始化依赖图
const depRelation: DepRelation = {};
// 获取项目文件相对项目根目录的路径
const getProjectPath = (dir: string) => {
  return path.relative(projectRootDir, dir);
};
// 收集依赖的函数。从入口开始收集
const collect = (entryDir: string) => {
  // 获取源代码
  const code = fs.readFileSync(entryDir, { encoding: 'utf-8' });
  // 源文件相对根目录的路径
  const entryProjectPath = getProjectPath(entryDir);
  // 分析过的模块不再分析
  if (depRelation[entryProjectPath]) {
    console.warn('有重复依赖', entryProjectPath);
    return;
  }
  // 添加对应的记录
  depRelation[entryProjectPath] = { deps: [], code };
  // 转成ast
  const ast = parse(code, { sourceType: 'module' });
  // 利用ast收集依赖关系
  traverse(ast, {
    enter: (item) => {
      if (item.node.type === 'ImportDeclaration') {
        // 依赖的绝对路径
        const depDir = path.resolve(
          path.dirname(entryDir),
          item.node.source.value
        );
        // 依赖相对于项目根目录的路径
        const depProjectPath = getProjectPath(depDir);
        depRelation[entryProjectPath].deps.push(depProjectPath);
        // 递归收集
        collect(depDir);
      }
    },
  });
};

collect(path.resolve(projectRootDir, './index.js'));

console.log('feng', depRelation);
