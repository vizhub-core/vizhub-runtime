export const d3DemoV3 = {
  "index.js": `
    import { select } from 'd3';
    export const main = () => {
      console.log(typeof select);
    }
  `,
  "package.json": `{
    "dependencies": {
      "d3": "7.9.0"
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
