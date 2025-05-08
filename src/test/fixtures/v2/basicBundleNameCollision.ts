export const basicBundleNameCollision = {
  "index.html": "<script src='bundle.js'></script>",
  "index.js": `
    import { foo } from "./foo.js";
    import { bar } from "./bar.js";
    console.log(foo, bar);
  `,
  "foo.js": "const x = 1; export const foo = x + 10;",
  "bar.js": "const x = 2; export const bar = x + 20;",
};
