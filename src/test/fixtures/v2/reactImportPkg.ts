export const reactImportPkg = {
  "index.html": `<script src='bundle.js'></script>`,
  "index.js": 'import React from "react"; console.log(typeof React);',
  "package.json": `{
    "dependencies": {
      "react": "18.2.0"
    },
    "vizhub": {
      "libraries": {
        "react": {
          "global": "React",
          "path": "/umd/react.production.min.js"
        }
      }
    }
  }`,
};
