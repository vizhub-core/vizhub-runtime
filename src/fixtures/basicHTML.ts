import { generateVizFileId, VizFiles } from "@vizhub/viz-types";

export const basicHTML: VizFiles = {
  [generateVizFileId()]: {
    name: "index.html",
    text: `<!DOCTYPE html>
<html>
  <head>
    <title>My HTML Document</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>This is my first HTML document.</p>
    <script>
      console.log('Hello, World!');
    </script
  </body>
</html>`,
  },
};
