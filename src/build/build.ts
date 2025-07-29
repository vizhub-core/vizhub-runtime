import { magicSandbox } from "magic-sandbox";
import { FileCollection } from "@vizhub/viz-types";
import type { RollupBuild, RollupOptions } from "rollup";
import {
  createVizCache,
  createVizContent,
  SlugCache,
  SvelteCompiler,
  v3Build,
  VizCache,
} from "../v3";
import { BuildResult } from "./types";
import { vizFilesToFileCollection } from "@vizhub/viz-utils";
import { determineRuntimeVersion } from "./determineRuntimeVersion";
import { v2Build } from "../v2";
import { v4Build } from "../v4";
import { VIRTUAL_PREFIX } from "../common/virtualFileSystem";
import { getRuntimeErrorHandlerScript } from "../common/runtimeErrorHandling";

const DEBUG = false;

/**
 * Adds runtime error handling to V1 HTML that was processed by magicSandbox
 */
const addRuntimeErrorHandlingToV1 = (html: string): string => {
  const errorHandlerScript = `<script>${getRuntimeErrorHandlerScript()}</script>`;
  
  // Try to inject before </head> if it exists
  if (html.includes('</head>')) {
    return html.replace('</head>', `${errorHandlerScript}\n</head>`);
  }
  
  // Try to inject before </body> if it exists
  if (html.includes('</body>')) {
    return html.replace('</body>', `${errorHandlerScript}\n</body>`);
  }
  
  // If neither exists, inject at the end
  return html + errorHandlerScript;
};

// Builds the given files.
export const build = async ({
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

  // True to enable sourcemaps, which help with
  // tracing runtime errors back to source code,
  // including specific source files and line numbers.
  // When true, there is additional overhead
  // for generating the sourcemaps, and the generated bundle
  // is larger.
  enableSourcemap?: boolean;

  // Only required for v3 runtime
  // For v3, EITHER files OR vizCache is required
  vizCache?: VizCache;

  // Only required for v3 runtime
  vizId?: string;

  // Only required for v3 runtime
  slugCache?: SlugCache;

  // Only required for v3 runtime
  getSvelteCompiler?: () => Promise<SvelteCompiler>;
}): Promise<BuildResult> => {
  try {
    DEBUG &&
      console.log(
        "[build] files:",
        files
          ? JSON.stringify(files).substring(0, 100)
          : undefined,
      );
    DEBUG && console.log("[build] vizCache:", vizCache);
    DEBUG && console.log("[build] vizId:", vizId);

    if (!files && !vizCache) {
      throw new Error(
        "Either files or vizCache is required",
      );
    }

    if (!files && vizCache && !vizId) {
      throw new Error(
        "vizId is required when using vizCache",
      );
    }

    if (!files && vizCache && vizId) {
      files = vizFilesToFileCollection(
        (await vizCache.get(vizId))?.files,
      );
    }

    if (!files) {
      throw new Error("Upable to extract viz files");
    }

    const runtimeVersion = determineRuntimeVersion(files);
    DEBUG &&
      console.log("[build] version:", runtimeVersion);
    if (runtimeVersion === "v1") {
      return {
        html: addRuntimeErrorHandlingToV1(magicSandbox(files)),
        runtimeVersion,
      };
    }

    if (runtimeVersion === "v2") {
      if (!rollup) {
        throw new Error(
          "Rollup is required for v2 runtime",
        );
      }
      return {
        html: magicSandbox(
          await v2Build({ files, rollup, enableSourcemap }),
        ),
        runtimeVersion,
      };
    }
    if (runtimeVersion === "v3") {
      if (!rollup) {
        throw new Error(
          "Rollup is required for v3 runtime",
        );
      }

      // We set up a "fake" viz cache.
      // It's needed because of the way the CSS import resolution works.
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

      if (!vizCache) {
        throw new Error(
          "vizCache is required for v3 runtime",
        );
      }

      if (!vizId) {
        throw new Error(
          "vizId is required for v3 runtime if vizCache is provided",
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

    if (runtimeVersion === "v4") {
      if (!rollup) {
        throw new Error(
          "Rollup is required for v4 runtime",
        );
      }
      DEBUG &&
        console.log("[build] v4Build", {
          files,
          rollup,
          enableSourcemap,
        });
      return {
        html: magicSandbox(
          await v4Build({ files, rollup, enableSourcemap }),
        ),
        runtimeVersion,
      };
    }
    throw new Error(
      `Unsupported runtime version: ${runtimeVersion}`,
    );
  } catch (error) {
    if (error instanceof Error) {
      // Clean up the error message for user facing error messages.
      if (error.message.indexOf(VIRTUAL_PREFIX)) {
        error.message = error.message.replace(
          VIRTUAL_PREFIX,
          "",
        );
      }
    }
    throw error;
  }
};
