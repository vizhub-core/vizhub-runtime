import type {
  RollupBuild,
  RollupOptions,
  OutputOptions,
} from "rollup";
import { FileCollection } from "@vizhub/viz-types";
// @ts-ignore
import libraries from "vizhub-libraries";
import { virtualFileSystem } from "../common/virtualFileSystem.js";
import { sucrasePlugin } from "../common/sucrasePlugin.js";
import {
  getGlobals,
  packageJSON,
} from "../common/packageJson.js";

export const computeBundleJSV2 = async ({
  files,
  rollup,
  enableSourcemap = true,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
}): Promise<string> => {
  // Check if the files contain index.js
  let entryPoint = "index.js";
  let indexJSContent = files[entryPoint];

  // Check for index.jsx as a fallback
  if (!indexJSContent) {
    entryPoint = "index.jsx";
    const indexJSContent = files[entryPoint];
    if (!indexJSContent) {
      throw new Error(
        "Missing entry point, can't find index.js or index.jsx",
      );
    }
  }

  const inputOptions: RollupOptions = {
    input: "./" + entryPoint,
    plugins: [virtualFileSystem(files), sucrasePlugin()],
    onwarn(warning, warn) {
      // Suppress "treating module as external dependency" warnings
      if (warning.code === "UNRESOLVED_IMPORT") return;
      warn(warning);
    },
  };

  const outputOptions: OutputOptions = {
    format: "iife",
    sourcemap: enableSourcemap,
  };

  const pkg = packageJSON(files);

  if (pkg) {
    const globals = {
      // Pre-configured globals for v2 only
      ...libraries,
      // Libraries from package.json
      ...getGlobals(pkg),
    };
    if (globals) {
      inputOptions.external = Object.keys(globals);
      outputOptions.globals = globals;
    }
  }

  const bundle = await rollup(inputOptions);

  const { output } = await bundle.generate(outputOptions);
  return output[0].code;
};
