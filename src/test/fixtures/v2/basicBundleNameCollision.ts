export const basicBundleNameCollision = {
  "index.html": "<script src='bundle.js'></script>",
  "index.js": `
    import { foo } from "./foo.js";
    import { bar } from "./bar.js";
    
    console.log(foo, bar);
  `,
  "foo.js": "const x_foo = 1; export const foo = x_foo + 10;",
  "bar.js": "const x_bar = 2; export const bar = x_bar + 20;",
};
