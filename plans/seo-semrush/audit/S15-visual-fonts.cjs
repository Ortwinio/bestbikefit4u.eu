module.exports = new Proxy({}, {
  get(_target, url) {
    const family = new URL(url).searchParams.get("family").split(":")[0];
    const files = {
      "Bricolage Grotesque": ["bricolage-grotesque-latin.woff2", "600 800"],
      Figtree: ["figtree-latin.woff2", "400 700"],
      "DM Mono": ["dm-mono-latin.woff2", "500"],
    };
    const font = files[family];
    if (!font) throw new Error(`Unexpected font family: ${family}`);
    const file = `${process.cwd()}/public/brand/report/fonts/${font[0]}`;
    return `/* latin */\n@font-face { font-family: '${family}'; font-style: normal; font-weight: ${font[1]}; font-display: swap; src: url(${file}) format('woff2'); }`;
  },
});
