import { FileCollection } from "../types";
import { virtualFileSystem } from "./virtualFileSystem";
import { sucrasePlugin } from "./sucrasePlugin";
import type { RollupBuild, RollupOptions, OutputOptions } from "rollup";

const globals = {
  d3: "d3",
  react: "React",
  "react-dom": "ReactDOM",
};

export const computeBundleJS = async ({
  files,
  rollup,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
}): Promise<string> => {
  const indexJSContent = files["index.js"];
  if (!indexJSContent) {
    throw new Error("Missing index.js");
  }

  const inputOptions: RollupOptions = {
    input: "./index.js",
    plugins: [virtualFileSystem(files), sucrasePlugin()],
    onwarn(warning, warn) {
      // Suppress "treating module as external dependency" warnings
      if (warning.code === "UNRESOLVED_IMPORT") return;
      warn(warning);
    },
  };

  const bundle = await rollup(inputOptions);

  const outputOptions: OutputOptions = {
    format: "iife",
    globals,
  };

  const { output } = await bundle.generate(outputOptions);
  return output[0].code;
};
