export const esmBuild = {
  "index.html": `<!DOCTYPE html>
  <html>
    <head>
      <title>ESM Build Test</title>
    </head>
    <body>
      <script type="module" src="index.js"></script>
    </body>
  </html>`,
  "index.js": `import { format } from 'date-fns';
console.log(format(new Date(), 'yyyy-MM-dd'));`,
  "package.json": `{
    "dependencies": {
      "date-fns": "2.30.0"
    }
  }`,
};
