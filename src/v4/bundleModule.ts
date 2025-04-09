import type {
  RollupBuild,
  RollupOptions,
  OutputOptions,
} from "rollup";
import { FileCollection } from "@vizhub/viz-types";
import { virtualFileSystem } from "..//common/virtualFileSystem.js";
import { sucrasePlugin } from "..//common/sucrasePlugin.js";
import { dependencies } from "../common/packageJson.js";

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
  const inputOptions: RollupOptions = {
    input: `./${entryPoint}`,
    plugins: [virtualFileSystem(files), sucrasePlugin()],
    // external: (source: string) => {
    //   console.log("external", source);
    //   return !source.startsWith(".");
    // },
    onwarn(w, warn) {
      if (w.code === "UNRESOLVED_IMPORT") return; // quiet noisy warnings
      warn(w);
    },
  };

  // if (dependencies(files)) {
  //   inputOptions.external = Object.keys(
  //     dependencies(files),
  //   );
  // }

  const bundle = await rollup(inputOptions);
  const { output } = await bundle.generate({
    format: "es",
    sourcemap: enableSourcemap,
  } as OutputOptions);

  return output[0].code;
};
