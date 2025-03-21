The Vizub Runtime version 2 (v2) is a more advanced runtime for running JavaScript code in a web page. It is designed to be more powerful and flexible than v0, and it is suitable for more advanced projects. It is based on the [Magic Sandbox](https://www.npmjs.com/package/magic-sandbox) package and additionally uses [Rollup](https://rollupjs.org/) with custom plugins for bundling. It supports:

- Everything that v1 supports
- Bundling of `index.js` to `bundle.js` with Rollup
- `import` and `export` statements in JavaScript files
- JSX for React components
- `package.json` which specifies dependencies and their mappings to CDN URLs
- Only browser builds (UMD) are supported for now
