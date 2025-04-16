import { rollup } from "@rollup/browser";
import { VizContent, VizId } from "@vizhub/viz-types";
import type { RollupBuild, RollupOptions } from "rollup";
import {
  svelteCompilerUrl,
  createVizCache,
  createSlugCache,
} from "../v3";
import { generateRequestId } from "./generateRequestId";
import { BuildWorkerMessage } from "./types";
import { build } from "../build";

// Flag for debugging
const DEBUG = true;

export const initWorker = () => {
  DEBUG && console.log("[worker] initializing...");
  // Inspired by
  // https://github.com/sveltejs/sites/blob/master/packages/repl/src/lib/workers/bundler/index.js#L44
  // unpkg doesn't set the correct MIME type for .cjs files
  // https://github.com/mjackson/unpkg/issues/355
  const getSvelteCompiler = async () => {
    const compiler = await fetch(svelteCompilerUrl).then(
      (r) => r.text(),
    );
    (0, eval)(compiler);

    // @ts-ignore
    return self.svelte.compile;
  };

  // Tracks pending promises for 'contentResponse' messages
  const pendingContentResponsePromises = new Map();

  // Tracks pending promises for 'resolveSlugResponse' messages
  const pendingResolveSlugResponsePromises = new Map();

  // Create a viz cache that's backed by the main thread
  const vizCache = createVizCache({
    initialContents: [],
    handleCacheMiss: async (
      vizId: VizId,
    ): Promise<VizContent> => {
      const message = {
        type: "contentRequest",
        vizId,
      };

      if (DEBUG) {
        console.log(
          "[worker] sending content request message to main thread",
          message,
        );
      }
      postMessage(message);

      return new Promise((resolve) => {
        pendingContentResponsePromises.set(vizId, resolve);
      });
    },
  });

  // Create a slug cache that's backed by the main thread
  const slugCache = createSlugCache({
    initialMappings: {},
    handleCacheMiss: async (slug) => {
      const requestId = generateRequestId();
      const message = {
        type: "resolveSlugRequest",
        slugKey: slug,
        requestId,
      };

      if (DEBUG) {
        console.log(
          "[worker] sending resolve slug request message to main thread",
          message,
        );
      }
      postMessage(message);

      return new Promise((resolve) => {
        pendingResolveSlugResponsePromises.set(
          requestId,
          resolve,
        );
      });
    },
  });

  // Handle messages from the main thread
  addEventListener("message", async (event) => {
    const data: BuildWorkerMessage = event.data;

    DEBUG &&
      console.log("[worker] received message:", data);

    switch (data.type) {
      case "buildRequest": {
        const { files, enableSourcemap, requestId } = data;

        try {
          // Build HTML from the files
          const buildResult = await build({
            files,
            enableSourcemap,
            rollup: rollup as (
              options: RollupOptions,
            ) => Promise<RollupBuild>,
            getSvelteCompiler,
            // vizCache,
            slugCache,
          });
          const message: BuildWorkerMessage = {
            type: "buildResponse",
            buildResult,
            requestId,
          };
          // Send the built HTML back to the main thread
          postMessage(message);
        } catch (error) {
          DEBUG &&
            console.log("[worker] build error:", error);

          const message: BuildWorkerMessage = {
            type: "buildResponse",
            error: "" + error,
            requestId,
          };

          // Send the error back to the main thread
          postMessage(message);
        }
        break;
      }

      case "contentResponse": {
        // Resolve pending promises for content snapshots
        const resolver = pendingContentResponsePromises.get(
          data.vizId,
        );
        if (resolver) {
          resolver(data.content);
          pendingContentResponsePromises.delete(data.vizId);
        }
        break;
      }

      case "invalidateVizCacheRequest": {
        if (DEBUG) {
          console.log(
            "[worker] received invalidateVizCacheRequest",
            data,
          );
        }
        const { changedVizIds } = data;

        // Invalidate the viz cache for the changed vizzes
        for (const vizId of changedVizIds) {
          vizCache.invalidate(vizId);
        }

        postMessage({
          type: "invalidateVizCacheResponse",
        });
        break;
      }

      case "resolveSlugResponse": {
        // Resolve pending promises for slug resolution
        const resolver =
          pendingResolveSlugResponsePromises.get(
            data.requestId,
          );
        if (resolver) {
          resolver(data.vizId);
          pendingResolveSlugResponsePromises.delete(
            data.requestId,
          );
        }
        break;
      }
    }
  });
};
