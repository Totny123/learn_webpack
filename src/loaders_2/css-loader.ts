const transform = (code: string) => {
  return `
      var cssStr=${JSON.stringify(code)}
      export default cssStr
    `;
};

export default transform;
