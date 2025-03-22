export const d3ImportPkg = {
  "index.html": `
    <script src='bundle.js'></script>
  `,
  "index.js": 'import { select } from "d3"; console.log(typeof select);',
  "package.json": `{
    "dependencies": {
      "d3": "6.7.0"
    },
    "vizhub": {
      "libraries": {
        "d3": {
          "global": "d3",
          "path": "/dist/d3.min.js"
        }
      }
    }
  }`,
};
