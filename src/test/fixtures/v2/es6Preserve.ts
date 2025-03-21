export const es6Preserve = {
  "index.html": `
    <script src='bundle.js'></script>
  `,
  "index.js": "const fn = a => a * a; console.log(fn(4));",
};
