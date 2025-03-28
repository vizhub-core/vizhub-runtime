export const xmlTest = {
  "index.html": `<!DOCTYPE html>
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
  "data.xml": `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <item>Test</item>
</root>`,
};
