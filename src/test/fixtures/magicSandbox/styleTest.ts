import { generateVizFileId, VizFiles } from "@vizhub/viz-types";

export const styleTest: VizFiles = {
  [generateVizFileId()]: {
    name: "index.html",
    text: `<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div id="test">Test</div>
    <script>
      console.log(window.getComputedStyle(document.getElementById('test')).color);
    </script>
  </body>
</html>`,
  },
  [generateVizFileId()]: {
    name: "styles.css",
    text: `#test { color: rgb(255, 0, 0); }`,
  },
};
