import { transform } from "sucrase";
import type { Plugin } from "rollup";

export function sucrasePlugin(
  additionalOptions = {},
): Plugin {
  return {
    name: "sucrase",
    transform(code, id) {
      // Transform .js, .jsx, and .tsx files
      if (!id.match(/\.(?:js|[jt]sx)$/)) {
        return null;
      }

      const result = transform(code, {
        transforms: ["jsx", "typescript"],

        // For source maps
        filePath: id,
        sourceMapOptions: {
          compiledFilename: "bundle.js",
        },
        production: true,
        ...additionalOptions,
      });

      return {
        code: result.code,
        map: result.sourceMap,
      };
    },
  };
}
