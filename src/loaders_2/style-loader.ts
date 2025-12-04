const transform = (code: string) => {
  // 有问题。css-loader处理后的code是js代码。而不是css字符串。
  return `
      if(document){
        var styleEl=document.createElement("style");
        styleEl.innerHTML=${JSON.stringify(code)};
        document.head.append(styleEl)
      }
    `;
};

export default transform;
