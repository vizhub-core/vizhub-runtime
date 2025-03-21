import { FileCollection, magicSandbox } from "magic-sandbox";
import { determineRuntimeVersion } from "./determineRuntimeVersion";
import { v2Build } from "./v2";
import type { RollupBuild, RollupOptions } from "rollup";

export const buildHTML = async ({
  files,
  rollup,
}: {
  files: FileCollection;
  rollup?: (options: RollupOptions) => Promise<RollupBuild>;
}): Promise<string> => {
  const version = determineRuntimeVersion(files);
  if (version === "v1") {
    return magicSandbox(files);
  }
  if (version === "v2") {
    if (!rollup) {
      throw new Error("Rollup is required for v2 runtime");
    }
    return magicSandbox(await v2Build({ files, rollup }));
  }
  throw new Error(`Unsupported runtime version: ${version}`);
};
