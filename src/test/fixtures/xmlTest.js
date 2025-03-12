import { generateVizFileId } from "@vizhub/viz-types";
export const xmlTest = {
    [generateVizFileId()]: {
        name: "index.html",
        text: `<!DOCTYPE html>
<html>
  <body>
    <script>
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'data.xml');
      xhr.onload = () => {
        console.log(xhr.responseXML.documentElement.nodeName);
      };
      xhr.send();
    </script>
  </body>
</html>`,
    },
    [generateVizFileId()]: {
        name: "data.xml",
        text: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <item>Test</item>
</root>`,
    },
};
