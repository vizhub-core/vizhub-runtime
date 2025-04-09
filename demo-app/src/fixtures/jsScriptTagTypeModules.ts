export const jsScriptTagTypeModules = {
  label: "Local ES Modules (v4)",
  status: "working",
  files: {
    "index.html": `<!DOCTYPE html>
  <html>
    <head>
    </head>
    <body>
      <script type="module" src="index.js"></script>
    </body>
  </html>`,
    "index.js": `import { greeting } from './greeter.js';\nconsole.log(greeting);`,
    "greeter.js": `export const greeting = "Hello, ES Module File!";`,
  },
};
