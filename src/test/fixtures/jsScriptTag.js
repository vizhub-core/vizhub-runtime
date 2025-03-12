import { generateVizFileId } from "@vizhub/viz-types";
export const jsScriptTag = {
    [generateVizFileId()]: {
        name: "index.html",
        text: `<!DOCTYPE html>
<html>
  <body>
    <script src="index.js"></script>
  </body>
</html>`,
    },
    [generateVizFileId()]: {
        name: "index.js",
        text: `console.log('Hello, JS!');`,
    },
};
