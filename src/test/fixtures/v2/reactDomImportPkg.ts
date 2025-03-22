export const reactDomImportPkg = {
  "index.html": `
    <script src='bundle.js'></script>
  `,
  "index.js": 'import ReactDOM from "react-dom"; console.log(typeof ReactDOM);',
  "package.json": `{
    "dependencies": {
      "react": "18.2.0",
      "react-dom": "18.2.0"
    },
    "vizhub": {
      "libraries": {
        "react": {
          "global": "React",
          "path": "/umd/react.production.min.js"
        },
        "react-dom": {
          "global": "ReactDOM",
          "path": "/umd/react-dom.production.min.js"
        }
      }
    },
  }`,
};
