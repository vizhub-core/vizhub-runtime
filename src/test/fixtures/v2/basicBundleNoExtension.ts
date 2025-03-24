export const basicBundleNoExtension = {
  "index.html": "<script src='bundle.js'></script>",
  "index.js":
    'import { foo } from "./foo"; console.log(foo);',
  "foo.js": 'export const foo = "bar";',
};
