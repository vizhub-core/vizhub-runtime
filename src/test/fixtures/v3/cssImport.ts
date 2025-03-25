export const cssImport = {
  "index.js": `
    import './styles.css';
    console.log(getComputedStyle(document.body).color);
  `,
  "styles.css": `
    body { color: red; }
  `,
  "error.js": `
export function generateError() {
  // This is line 3 in error.js
  throw new Error("Test error for sourcemap validation");
}
`,
  "index.html": "<script src='bundle.js'></script>",
  "main.js": `
import { generateError } from "./error.js";

// Line numbers are important for this test
// This will be line 6 in the original source
generateError();

// Add a console log to help debug
console.log("If you see this, the error was caught by the window.onerror handler");
`,
};
