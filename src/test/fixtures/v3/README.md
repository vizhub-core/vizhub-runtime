The VizHub version 3 (v3) runtime is a more constrained runtime for running JavaScript code in a web page. It is primarily designed to support hot reloading of JavaScript code in a web page. Notably, it does _not_ use Magic Sandbox. It does use [Rollup](https://rollupjs.org/) with custom plugins for bundling. It supports:

- The absence of `index.html`
- An `index.js` entry point that exports a `main` function
- Hot reloading of JavaScript code
- `import` and `export` statements in JavaScript files
- `import` of CSS files in JavaScript files
- `import` of CSV files in JavaScript files
- `import` of exports across vizzes in the VizHub platform
- Svelte source files
- `package.json` which specifies dependencies and their mappings to CDN URLs
- Only browser builds (UMD) are supported for now
