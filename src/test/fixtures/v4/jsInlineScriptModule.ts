export const jsInlineScriptModule = {
  "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>D3 Example</title>
    <script type="importmap">
      { "imports": { "d3": "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm" } }
    </script>
  </head>
  <body>
    <div id="viz-container"></div>
    <script type="module">
      import { main } from "./index.js";
      main(document.getElementById("viz-container"));
    </script>
  </body>
</html>`,
  "index.js": `export function main(container) {
  container.innerHTML = "Hello from inline script!";
  console.log("Hello from inline script!");
}`,
};
