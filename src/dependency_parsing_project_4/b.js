import a from './a.js';

const b = {
  value: 'b',
  getA() {
    return a.value;
  },
};

export default b;
