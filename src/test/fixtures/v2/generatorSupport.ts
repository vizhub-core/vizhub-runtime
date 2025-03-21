export const generatorSupport = {
  "index.html": `
    <script src='bundle.js'></script>
  `,
  "index.js": "console.log(function* () { yield 5; }().next().value)",
};
