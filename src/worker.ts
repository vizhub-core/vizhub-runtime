import { rollup } from "@rollup/browser";
import { VizContent, VizId } from "@vizhub/viz-types";
import type { RollupBuild, RollupOptions } from "rollup";
import { buildHTML } from "./buildHTML";
import { svelteCompilerUrl } from "./v3/transformSvelte";
import { createVizCache } from "./v3/vizCache";
import { createSlugCache } from "./v3/slugCache";

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

  // Generate a unique request ID
  const generateRequestId = (): string =>
    (Math.random() + "").slice(2);

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
    const { data } = event;

    DEBUG &&
      console.log("[worker] received message:", data);

    switch (data.type) {
      case "buildHTMLRequest": {
        const { fileCollection, vizId, enableSourcemap } =
          data;

        try {
          // Build HTML from the files
          const html = await buildHTML({
            files: fileCollection,
            vizId,
            enableSourcemap,
            rollup: rollup as (
              options: RollupOptions,
            ) => Promise<RollupBuild>,
            getSvelteCompiler,
            // vizCache,
            slugCache,
          });

          // Send the built HTML back to the main thread
          postMessage({
            type: "buildHTMLResponse",
            html,
          });
        } catch (error) {
          DEBUG &&
            console.log("[worker] build error:", error);

          // Send the error back to the main thread
          postMessage({
            type: "buildHTMLResponse",
            error,
          });
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

      // case "resetSrcdocRequest": {
      //   // Invalidate viz cache for changed vizzes
      //   const { vizId, changedVizIds } = data;
      //   for (const changedVizId of changedVizIds) {
      //     vizCache.invalidate(changedVizId);
      //   }

      //   try {
      //     // Build fresh HTML
      //     const html = await buildHTML({
      //       vizId,
      //       enableSourcemap: true,
      //       rollup: rollup as (
      //         options: RollupOptions,
      //       ) => Promise<RollupBuild>,
      //       getSvelteCompiler,
      //       // TODO use vizCache for importing across vizzes,
      //       // but only if needed.
      //       // vizCache,
      //       slugCache,
      //     });

      //     // Send the built HTML back to the main thread
      //     postMessage({
      //       type: "resetSrcdocResponse",
      //       html,
      //     });
      //   } catch (error) {
      //     DEBUG &&
      //       console.error("[worker] build error:", error);

      //     // Send the error back to the main thread
      //     postMessage({
      //       type: "resetSrcdocResponse",
      //       error,
      //     });
      //   }
      //   break;
      // }
    }
  });
};
