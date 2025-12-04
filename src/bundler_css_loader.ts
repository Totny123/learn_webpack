/** 递归收集嵌套依赖 */
import * as path from 'path';
import * as fs from 'fs';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as babel from '@babel/core';
import transformSourceCode from './loaders/css-loader';

// 项目绝对路径
const projectRootDir = path.resolve(__dirname, './bundler_css');
// 声明依赖图的类型
type DepRelation = Array<{ key: string; deps: string[]; code: string }>;
// 初始化依赖图
const depRelation: DepRelation = [];
// 获取项目文件相对项目根目录的路径
const getProjectPath = (dir: string) => {
  return path.relative(projectRootDir, dir);
};
const wrapperFunction = (code: string) => {
  return `function(require,module,exports){${code}}`;
};
const transformDepRelation = (_depRelation: DepRelation) => {
  const items = _depRelation
    .map((item) => {
      return `
      {
        key: ${JSON.stringify(item.key)},
        deps: ${JSON.stringify(item.deps)},
        code: ${item.code}
      }`;
    })
    .join(',');
  return `[${items}]`;
};

// 收集依赖的函数。从入口开始收集
const collect = (entryDir: string) => {
  // 获取源代码
  const sourceCode = fs.readFileSync(entryDir, { encoding: 'utf-8' });
  let transformedCode = sourceCode;
  if (/\.css$/.test(entryDir.toLowerCase())) {
    transformedCode = transformSourceCode(transformedCode);
  }
  // 源文件相对根目录的路径
  const entryProjectPath = getProjectPath(entryDir);
  // 分析过的模块不再分析
  if (depRelation.find((i) => i.key === entryProjectPath)) {
    console.warn('有重复依赖', entryProjectPath);
    return;
  }
  // 转成es5代码
  const es5Result = babel.transform(transformedCode, {
    presets: ['@babel/preset-env'],
  });
  // 添加对应的记录
  const depRecord: DepRelation[0] = {
    key: entryProjectPath,
    deps: [],
    code: wrapperFunction(es5Result?.code || ''),
  };
  depRelation.push(depRecord);
  // 转成ast
  const ast = parse(transformedCode, { sourceType: 'module' });
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
        depRecord.deps.push(depProjectPath);
        // 递归收集
        collect(depDir);
      }
    },
  });
};

const getDistString = () => {
  return `
  var depRelation = ${transformDepRelation(depRelation)}
  // 缓存模块的导出
  var modulesCache = {};
  var execute = (key) => {
    if (modulesCache[key]) return modulesCache[key];
    var item = depRelation.find((i) => i.key === key);
    if(!item) throw new Error(key+'模块找不到')
    var pathToKey = function(path)  {
      var dirname = key.substring(0, key.lastIndexOf('/') + 1)
      var projectPath = (dirname + path).replace(/\\.\\//g, '').replace(/\\/\\//, '/')
      return projectPath
    }
    var require = function(path)  {
      return execute(pathToKey(path));
    };
    var exports = {
        __esModule: true,
      }
    var module = {
      exports: exports,
    };
    modulesCache[key]=module.exports;
    // 执行模块
    item.code(require, module, module.exports);
    // 返回模块的导出
    return module.exports;
  };
  execute(depRelation[0]?.key || '');`;
};

const bundler = () => {
  collect(path.resolve(projectRootDir, './index.js'));
  const distString = getDistString();
  if (fs.existsSync(path.resolve(projectRootDir, 'dist'))) {
    fs.rmdirSync(path.resolve(projectRootDir, 'dist'), { recursive: true });
  }
  fs.mkdirSync(path.resolve(projectRootDir, 'dist'), { recursive: true });
  fs.writeFileSync(path.resolve(projectRootDir, 'dist/index.js'), distString);
};

bundler();
