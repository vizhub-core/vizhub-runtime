export const imageInHTMLWithBundle = {
  "index.html": `<!DOCTYPE html>
<html>
  <head>
    <title>V2 Image Test</title>
  </head>
  <body>
    <h1>V2 Runtime Image Test</h1>
    <img src="logo.png" alt="Logo" class="logo" />
    <img src="icon.jpg" alt="Icon" />
    <script src="bundle.js"></script>
  </body>
</html>`,
  "index.js": `
import { message } from "./message.js";
console.log(message);
const container = document.body;
const p = document.createElement('p');
p.textContent = 'V2 bundled JavaScript loaded!';
container.appendChild(p);
  `,
  "message.js": `export const message = "Hello from V2 runtime with images!";`,
  "logo.png":
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  "icon.jpg":
    "/9j/4AAQSkZJRgABAQEBLAEsAAD/4RqSRXhpZgAASUkqAAgAAAAIAA4BAgASAAAAbgAAABIBAwABAAAAAQAAABoBBQABAAAAgAAAABsBBQABAAAAiAAAACgBAwABAAAAAgAAADEBAgANAAAAkAAAADIBAgAUAAAAngAAAGmHBAABAAAAsgAAAOoAAABDcmVhdGVkIHdpdGggR0lNUAAsAQAAAQAAACwBAAABAAAAR0lNUCAyLjEwLjMwAAA",
};

export const v3ImageImport = {
  "index.js": `
import logoSrc from './logo.png';
import iconSrc from './icon.gif';

export const main = (container) => {
  container.innerHTML = \`
    <h1>V3 Runtime Image Import</h1>
    <img src="\${logoSrc}" alt="Logo" />
    <img src="\${iconSrc}" alt="Icon" />
  \`;
};
  `,
  "logo.png":
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  "icon.gif":
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
};
