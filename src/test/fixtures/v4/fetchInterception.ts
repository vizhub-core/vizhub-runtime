export const fetchInterception = {
  "index.html": `<!DOCTYPE html>
  <html>
    <head>
      <title>Fetch Interception Test</title>
      <script type="importmap">
      {
        "imports": {
          "data-api": "./data-service.js"
        }
      }
      </script>
    </head>
    <body>
      <script type="module" src="index.js"></script>
    </body>
  </html>`,
  "index.js": `import { fetchData } from 'data-api';

fetchData().then(data => {
  console.log(data.message);
});`,
  "data-service.js": `export async function fetchData() {
  const response = await fetch('data.json');
  return response.json();
}`,
  "data.json": `{
  "message": "Fetch intercepted successfully"
}`,
};
