import {
  FileCollection,
  magicSandbox,
} from "magic-sandbox";
import type { RollupBuild, RollupOptions } from "rollup";
import { determineRuntimeVersion } from "./determineRuntimeVersion";
import { v2Build } from "./v2";
import { v3Build } from "./v3";
import { v4Build } from "./v4";
import { createVizCache, VizCache } from "./v3/vizCache";
import { createVizContent } from "./v3/createVizContent";
import { vizContentToFileCollection } from "./utils/vizContentToFileCollection";
import { SlugCache } from "./v3/slugCache";
import { SvelteCompiler } from "./v3/transformSvelte";

const DEBUG = false;

export const buildHTML = async ({
  files,
  rollup,
  enableSourcemap = true,
  vizCache,
  vizId,
  slugCache,
  getSvelteCompiler,
}: {
  // Only required for v1 and v2 runtime
  // For v3, EITHER files OR vizCache is required
  files?: FileCollection;

  // Only required for v2 and v3 runtime
  rollup?: (options: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;

  // Only required for v3 runtime
  // For v3, EITHER files OR vizCache is required
  vizCache?: VizCache;
  vizId?: string;
  slugCache?: SlugCache;
  getSvelteCompiler?: () => Promise<SvelteCompiler>;
}): Promise<string> => {
  if (!files && !vizCache) {
    throw new Error("Either files or vizCache is required");
  }

  if (!files && vizCache && !vizId) {
    throw new Error(
      "vizId is required when using vizCache",
    );
  }

  if (!files && vizCache && vizId) {
    files = vizContentToFileCollection(
      await vizCache.get(vizId),
    );
  }

  if (!files) {
    throw new Error("Upable to extract viz files");
  }

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

    if (!vizCache && !vizId) {
      const vizContent = createVizContent(files);
      vizId = vizContent.id;
      vizCache = createVizCache({
        initialContents: [vizContent],
        handleCacheMiss: async () => {
          throw new Error(
            "Cache miss handler not implemented",
          );
        },
      });
    }

    if (!vizCache || !vizId) {
      throw new Error(
        "vizCache and vizId are required for v3 runtime",
      );
    }

    return await v3Build({
      files,
      rollup,
      vizCache,
      vizId,
      slugCache,
      getSvelteCompiler,
    });
  }

  if (version === "v4") {
    if (!rollup) {
      throw new Error("Rollup is required for v4 runtime");
    }
    return magicSandbox(
      await v4Build({ files, rollup, enableSourcemap }),
    );
  }

  throw new Error(
    `Unsupported runtime version: ${version}`,
  );
};
