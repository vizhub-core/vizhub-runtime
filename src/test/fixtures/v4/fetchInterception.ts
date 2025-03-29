export const fetchInterception = {
  "index.html": `<!DOCTYPE html>
  <html>
    <head>
      <title>Fetch Interception Test</title>
    </head>
    <body>
      <script type="module" src="index.js"></script>
    </body>
  </html>`,
  "index.js": `
    fetch("data.json")
      .then(response => response.json())
      .then(data => console.log(data.message));`,
  "data.json": `{
    "message": "Fetch intercepted successfully"
 }`,
};
