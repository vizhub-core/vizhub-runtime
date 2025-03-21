export const reactImport = {
  "index.html": `
    <script src='https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js'></script>
    <script src='bundle.js'></script>
  `,
  "index.js": 'import React from "react"; console.log(typeof React);',
};
