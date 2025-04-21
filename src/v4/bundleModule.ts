import type {
  RollupBuild,
  RollupOptions,
  OutputOptions,
} from "rollup";
import { FileCollection } from "@vizhub/viz-types";
import { virtualFileSystem } from "..//common/virtualFileSystem.js";
import { sucrasePlugin } from "..//common/sucrasePlugin.js";
import { catchAll } from "./catchAll.js";

const DEBUG = true;

/**
 * Bundle a single ES module entry point
 */
export const bundleESModule = async ({
  entryPoint,
  files,
  rollup,
  enableSourcemap = true,
}: {
  entryPoint: string;
  files: FileCollection;
  rollup: (o: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
}): Promise<string> => {
  // Support either of these:
  // - <script type="module" src="index.js"></script>
  // - <script type="module" src="./index.js"></script>
  const input = entryPoint.startsWith("./")
    ? entryPoint
    : `./${entryPoint}`;

  const inputOptions: RollupOptions = {
    input,
    plugins: [
      virtualFileSystem(files),
      sucrasePlugin({
        // Enable JSX runtime
        // so we don't need to import React
        // in every file that uses JSX
        jsxRuntime: "automatic",
      }),
      catchAll(),
    ],
    // external: (source: string) => {
    //   DEBUG && console.log("external", source);

    //   // Handle strings resolved by `virtualFileSystem`.
    //   const isVirtualFile = source.startsWith("./");

    //   // Handle external dependencies, e.g. from import maps.
    //   const isLibrary = !source.startsWith("./");

    //   const isExternal = !isVirtualFile || isLibrary;

    //   DEBUG && console.log("isExternal", isExternal);
    //   return isExternal;
    // },
    onwarn(rollupLog, warn) {
      // console.log("onwarn", rollupLog);
      // if (w.code === "UNRESOLVED_IMPORT") return; // quiet noisy warnings
      // warn(rollupLog);

      // Ignore all warnings
      // TODO nicely present these warnings to the user
      return;
    },
  };

  const bundle = await rollup(inputOptions);
  const { output } = await bundle.generate({
    format: "es",
    sourcemap: enableSourcemap,
  } as OutputOptions);
  return output[0].code;
};
