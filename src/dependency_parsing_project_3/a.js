import b from './b.js';

// 有逻辑漏洞的循环依赖
const a = {
  value: b.value + 1,
};

export default a;
