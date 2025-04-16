// type FileCollection = Record<string, string>;
import { FileCollection } from "@vizhub/viz-types";

// where keys are file names and values are file contents.
export type runtimeVersion = "v1" | "v2" | "v3" | "v4";

export type VizHubRuntime = {
  // Resets the iframe srcdoc when code changes.
  run: (options: {
    // The fresh files to be built.
    files: FileCollection;
    // Toggle for hot reloading,
    // only respected for v3 runtime.
    hotReload?: boolean;
    // Toggle for sourcemaps.
    sourcemap?: boolean;
  }) => void;
  // Cleans up the event listeners from the Worker and the iframe.
  cleanup: () => void;
  invalidateVizCache: (
    changedVizIds: Array<string>,
  ) => Promise<void>;
};

export type BuildWorkerMessage =
  // `buildHTMLRequest`
  //  * Sent from the main thread to the worker.
  //  * When the main thread wants to build the HTML for the iframe.
  | {
      type: "buildHTMLRequest";
      fileCollection: FileCollection;
      vizId?: string;
      enableSourcemap: boolean;
    }

  // `buildHTMLResponse`
  //  * Sent from the worker to the main thread.
  //  * When the worker responds to a `buildHTMLRequest` message.
  //  * Provides:
  //  * EITHER a fresh `srcdoc` for the iframe
  //  * OR an `error` if the build failed.
  | {
      type: "buildHTMLResponse";
      html?: string;
      error?: Error;
    }

  // `contentRequest`
  //  * Sent from the worker to the main thread.
  //  * When the worker requests the content of an imported viz.
  | {
      type: "contentRequest";
      vizId: string;
    }

  // `contentResponse`
  //  * Sent from the main thread to the worker.
  //  * When the main thread responds to a contentRequest.
  | {
      type: "contentResponse";
      vizId: string;
      content: any;
    }

  // `resolveSlugRequest`
  //  * Sent from the worker to the main thread.
  //  * When the worker requests to resolve a slug to a viz ID.
  | {
      type: "resolveSlugRequest";
      slugKey: string;
      requestId: string;
    }

  // `resolveSlugResponse`
  //  * Sent from the main thread to the worker.
  //  * When the main thread responds with the resolved viz ID.
  | {
      type: "resolveSlugResponse";
      slugKey: string;
      vizId: string;
      requestId: string;
    }

  // `invalidateVizCacheRequest`
  //  * Sent from the main thread to the worker.
  //  * When viz content has changed and cache needs invalidation.
  | {
      type: "invalidateVizCacheRequest";
      changedVizIds: Array<string>;
    }

  // `invalidateVizCacheResponse`
  //  * Sent from the worker to the main thread.
  //  * Confirms cache invalidation.
  | {
      type: "invalidateVizCacheResponse";
    }

  // `resetSrcdocRequest`
  //  * Sent from the main thread to the worker.
  //  * When the runtime environment needs to be reset.
  | {
      type: "resetSrcdocRequest";
      vizId: string;
      changedVizIds: Array<string>;
    };
export type WindowMessage =
  // `runDone`
  //  * Sent from the iframe to the main thread.
  //  * Indicates successful code execution.
  | {
      type: "runDone";
    }

  // `runError`
  //  * Sent from the iframe to the main thread.
  //  * Indicates an error during code execution.
  | {
      type: "runError";
      error: Error;
    }

  // `writeFile`
  //  * Sent from the iframe to the main thread.
  //  * Request to write file content.
  | {
      type: "writeFile";
      fileName: string;
      content: string;
    };
