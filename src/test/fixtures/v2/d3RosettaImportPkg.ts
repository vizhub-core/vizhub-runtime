export const d3RosettaImportPkg = {
  "index.html": `
    <script src='bundle.js'></script>
  `,
  "index.js": 'import { one } from "d3-rosetta"; console.log(typeof one);',
  "package.json": `{
    "dependencies": {
      "d3-rosetta": "1.0.0"
    },
    "vizhub": {
      "libraries": {
        "d3-rosetta": {
          "global": "d3Rosetta",
          "path": "/dist/d3-rosetta.umd.js"
        }
      }
    }
  }`,
};
