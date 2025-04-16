import { FileCollection } from "@vizhub/viz-types";

// type FileCollection = Record<string, string>;
// where keys are file names and values are file contents.
export type runtimeVersion = "v1" | "v2" | "v3" | "v4";

export type VizHubRuntime = {
  // Resets the iframe srcdoc when code changes.
  reload: (
    // The fresh files to be built.
    fileCollection: FileCollection,
    options?: {
      // Toggle for hot reloading,
      // only respected for v3 runtime.
      hot?: boolean;
      // Toggle for sourcemaps.
      sourcemap?: boolean;
    },
  ) => void;
  // Cleans up the event listeners from the Worker and the iframe.
  cleanup: () => void;
  invalidateVizCache: (
    changedVizIds: Array<string>,
  ) => Promise<void>;
};

// The result of a build from the worker.
export type BuildResult = {
  // The bundled JavaScript code.
  src: string;
  // A list of CSS files generated or imported.
  cssFiles: Array<string>;
  // TODO: Add warnings, pkg, time like in V3BuildResult?
};

export type BuildWorkerMessage =
  // `buildRequest` (Renamed from buildHTMLRequest)
  //  * Sent from the main thread to the worker.
  //  * When the main thread requests a build.
  | {
      type: "buildRequest";
      fileCollection: FileCollection;
      vizId?: string;
      enableSourcemap: boolean;
    }

  // `buildResponse` (Renamed from buildHTMLResponse)
  //  * Sent from the worker to the main thread.
  //  * When the worker responds to a `buildRequest` message.
  //  * Provides:
  //  * EITHER the `buildResult`
  //  * OR an `error` if the build failed.
  | {
      type: "buildResponse";
      buildResult?: BuildResult;
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

// Messages sent to and from the IFrame window.
export type WindowMessage =
  // `runJS`
  //  * Sent from the main thread to the IFrame.
  //  * Triggers hot reloading of JS within the runtime.
  | {
      type: "runJS";
      src: string;
    }

  // `runCSS`
  //  * Sent from the main thread to the IFrame.
  //  * Triggers hot reloading of CSS within the runtime.
  | {
      type: "runCSS";
      // The resolved ID, e.g., "vizID/styles.css" or just "styles.css"
      id: string;
      // Empty string means remove the CSS
      src: string;
    }

  // `runDone`
  //  * Sent from the IFrame to the main thread.
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
