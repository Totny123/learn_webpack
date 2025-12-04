const transformSourceCode = (sourceCode: string) => {
  return `
      var cssStr=${JSON.stringify(sourceCode)}
      if(document){
        var styleEl=document.createElement("style");
        styleEl.innerHTML=cssStr;
        document.head.append(styleEl)
      }
      export default cssStr
      export {cssStr}
    `;
};

export default transformSourceCode;
