export const reactDomImport = {
  "index.html": `
    <script src='https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js'></script>
    <script src='https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js'></script>
    <script src='bundle.js'></script>
  `,
  "index.js": 'import ReactDOM from "react-dom"; console.log(typeof ReactDOM);',
};
