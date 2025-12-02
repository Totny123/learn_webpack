import b from './b.js';

const a = {
  value: 'a',
  getB() {
    return b.value;
  },
};

export default a;
