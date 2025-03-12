import { generateVizFileId } from "@vizhub/viz-types";
export const fetchProxy = {
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
        text: `fetch("data.csv")
        .then((response) => response.text())
        .then(console.log);`,
    },
    [generateVizFileId()]: {
        name: "data.csv",
        text: `Hello, Fetch!`,
    },
};
