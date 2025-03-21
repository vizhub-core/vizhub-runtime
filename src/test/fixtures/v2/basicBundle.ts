export const basicBundle = {
  "index.html": "<script src='bundle.js'></script>",
  "index.js": 'import { foo } from "./foo.js"; console.log(foo);',
  "foo.js": 'export const foo = "bar";',
};
