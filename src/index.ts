import {
  FileCollection,
  magicSandbox,
} from "magic-sandbox";
import type { RollupBuild, RollupOptions } from "rollup";
import { determineRuntimeVersion } from "./determineRuntimeVersion";
import { v2Build } from "./v2";
import { v3Build } from "./v3";
import { createVizCache, VizCache } from "./v3/vizCache";
import { createVizContent } from "./v3/createVizContent";

const DEBUG = false;

export const buildHTML = async ({
  files,
  rollup,
  enableSourcemap = true,
  // vizCache,
}: {
  files: FileCollection;

  // Only required for v2 and v3 runtime
  rollup?: (options: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;

  // Only required for v3 runtime
  // vizCache?: VizCache;
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
    return magicSandbox(
      await v2Build({ files, rollup, enableSourcemap }),
    );
  }
  if (version === "v3") {
    if (!rollup) {
      throw new Error("Rollup is required for v3 runtime");
    }
    const vizContent = createVizContent(files);
    const vizId = vizContent.id;
    const vizCache = createVizCache({
      initialContents: [vizContent],
      handleCacheMiss: async () => {
        throw new Error(
          "Cache miss handler not implemented",
        );
      },
    });
    return await v3Build({
      files,
      rollup,
      vizCache,
      vizId,
    });
  }

  throw new Error(
    `Unsupported runtime version: ${version}`,
  );
};
