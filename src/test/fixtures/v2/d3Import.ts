export const d3Import = {
  "index.html": `
    <script src='https://cdn.jsdelivr.net/npm/d3@6.7.0/dist/d3.min.js'></script>
    <script src='bundle.js'></script>
  `,
  "index.js":
    'import { select } from "d3"; console.log(typeof select);',
};
