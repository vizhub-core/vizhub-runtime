export const cssImport = {
  "index.js": `
    import './styles.css';
    console.log(getComputedStyle(document.body).color);
  `,
  "styles.css": `
    body { color: red; }
  `,
};
