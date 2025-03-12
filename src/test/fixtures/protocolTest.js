import { generateVizFileId } from "@vizhub/viz-types";
export const protocolTest = {
    [generateVizFileId()]: {
        name: "index.html",
        text: `<!DOCTYPE html>
<html>
  <head>
    <link href="//fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
    <script src="//code.jquery.com/jquery-3.6.0.min.js"></script>
  </head>
  <body>
    <div>Protocol Test</div>
    <script>
      console.log('Protocol test loaded');
    </script>
  </body>
</html>`,
    },
};
