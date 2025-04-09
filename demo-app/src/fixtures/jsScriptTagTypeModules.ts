export const jsScriptTagTypeModules = {
  label: "Local ES Modules (v4)",
  status: "working",
  files: {
    "index.html": `<!DOCTYPE html>
  <html>
    <head>
      <style>
        .message {
          font-size: 48px;
          text-align: center;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      </style>
    </head>
    <body>
      <div id="app"></div>
      <script type="module" src="index.js"></script>
    </body>
  </html>`,
    "index.js": `import { greeting } from './greeter.js';\n\nconst app = document.getElementById('app');\nconst messageDiv = document.createElement('div');\nmessageDiv.className = 'message';\nmessageDiv.textContent = greeting;\napp.appendChild(messageDiv);`,
    "greeter.js": `export const greeting = "Hello, ES Module File!";`,
  },
};
