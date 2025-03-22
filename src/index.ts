import { FileCollection, magicSandbox } from "magic-sandbox";
import type { RollupBuild, RollupOptions } from "rollup";
import { determineRuntimeVersion } from "./determineRuntimeVersion";
import { v2Build } from "./v2";
// import { v3Build } from "./v3";

const DEBUG = false;

export const buildHTML = async ({
  files,
  rollup,
}: {
  files: FileCollection;
  rollup?: (options: RollupOptions) => Promise<RollupBuild>;
}): Promise<string> => {
  const version = determineRuntimeVersion(files);
  DEBUG && console.log("[buildHTML] version:", version);
  if (version === "v1") {
    return magicSandbox(files);
  }
  if (version === "v2") {
    if (!rollup) {
      throw new Error("Rollup is required for v2 runtime");
    }
    return magicSandbox(await v2Build({ files, rollup }));
  }
  // if (version === "v3") {
  //   if (!rollup) {
  //     throw new Error("Rollup is required for v3 runtime");
  //   }
  //   return await v3Build({ files, rollup });
  // }

  throw new Error(`Unsupported runtime version: ${version}`);
};
