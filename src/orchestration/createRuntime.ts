import {
  FileCollection,
  VizContent,
  VizId,
} from "@vizhub/viz-types";
import {
  BuildWorkerMessage,
  VizHubRuntime,
} from "../types";
import { generateRequestId } from "./generateRequestId";

// Flag for debugging.
const DEBUG = false;

// State constants:

// Nothing happening.
const IDLE = "IDLE";

// An update has been enqueued
// via requestAnimationFrame.
const ENQUEUED = "ENQUEUED";

// An update (build and run) is pending,
// and the files have not changed.
const PENDING_CLEAN = "PENDING_CLEAN";

// An update (build and run) is pending,
// and the files have changed
// while this run is taking place.
const PENDING_DIRTY = "PENDING_DIRTY";

// Valid State Transitions:
//
//  * IDLE --> ENQUEUED
//    When the system is idle and files are changed.
//
//  * ENQUEUED --> PENDING_CLEAN
//    When the pending changes run.
//
//  * PENDING_CLEAN --> IDLE
//    When the pending update finishes running
//    and files were not changed in the mean time.
//
//  * PENDING_CLEAN --> PENDING_DIRTY
//    When files are changed while an update is pending.
//
//  * PENDING_DIRTY --> ENQUEUED
//    When the pending update finishes running
//    and files were changed in the mean time.
//
// When a build error happens, the state is set to IDLE.
// This is to prevent a build error from causing
// the whole system to stop working.

// Creates an instance of the VizHub Runtime Environment.
// This is the main entry point for the runtime, for use
// by front end applications.
// It sets up the iframe and worker, and handles messages
// between them.
// For server-side rendering where only a build is required,
// just use the buildHTML function directly.
export const createRuntime = ({
  iframe,
  worker,
  setBuildErrorMessage,
  vizId,
  getLatestContent,
  resolveSlugKey,
  writeFile,
}: {
  iframe: HTMLIFrameElement;
  worker: Worker;
  setBuildErrorMessage?: (error: string | null) => void;
  vizId?: VizId;
  getLatestContent?: (vizId: VizId) => Promise<VizContent>;
  resolveSlugKey?: (slugKey: string) => Promise<VizId>;
  writeFile?: (fileName: string, content: string) => void;
}): VizHubRuntime => {
  // Track the current state of the runtime
  let state:
    | typeof IDLE
    | typeof ENQUEUED
    | typeof PENDING_CLEAN
    | typeof PENDING_DIRTY = IDLE;

  // Pending promise resolvers
  let pendingBuildPromise:
    | ((html?: string) => void)
    | null = null;
  let pendingRunPromise: (() => void) | null = null;

  // This runs when the build worker sends a message.
  const workerListener: (e: MessageEvent) => void = ({
    data,
  }: {
    data: BuildWorkerMessage;
  }) => {
    if (data.type === "buildHTMLResponse") {
      const html: string | undefined = data.html;
      const error: Error | undefined = data.error;

      // Resolve the pending build promise
      if (pendingBuildPromise) {
        pendingBuildPromise(html);
        pendingBuildPromise = null;
      }

      if (error) {
        setBuildErrorMessage &&
          setBuildErrorMessage(error.message);
      } else {
        setBuildErrorMessage && setBuildErrorMessage(null);
      }
    } else if (
      data.type === "contentRequest" &&
      getLatestContent
    ) {
      const { vizId } = data;

      getLatestContent(vizId).then((content) => {
        worker.postMessage({
          type: "contentResponse",
          vizId,
          content,
        });
      });
    } else if (
      data.type === "resolveSlugRequest" &&
      resolveSlugKey
    ) {
      const { slugKey, requestId } = data;

      resolveSlugKey(slugKey).then((vizId) => {
        worker.postMessage({
          type: "resolveSlugResponse",
          slugKey,
          vizId,
          requestId,
        });
      });
    }
  };

  worker.addEventListener("message", workerListener);

  // Handle messages from the iframe
  const windowListener = (event: MessageEvent) => {
    const data = event.data;

    if (
      data.type === "runDone" ||
      data.type === "runError"
    ) {
      if (pendingRunPromise) {
        pendingRunPromise();
        pendingRunPromise = null;
      }

      if (data.type === "runError") {
        setBuildErrorMessage &&
          setBuildErrorMessage(data.error.message);
      }
    }

    if (data.type === "writeFile" && writeFile) {
      if (data.fileName && data.content) {
        writeFile(data.fileName, data.content);
      }
    }
  };

  // This runs when the IFrame sends a message.
  window.addEventListener("message", windowListener);

  const cleanup = () => {
    worker.removeEventListener("message", workerListener);
    window.removeEventListener("message", windowListener);
  };

  // Build the code
  const build = (
    fileCollection: FileCollection,
  ): Promise<string | undefined> => {
    return new Promise<string | undefined>((resolve) => {
      pendingBuildPromise = resolve;
      const message: BuildWorkerMessage = {
        type: "buildHTMLRequest",
        fileCollection,
        vizId,
        enableSourcemap: true,
      };
      worker.postMessage(message);
    });
  };

  // Update the runtime with new code
  const update = async (fileCollection: FileCollection) => {
    state = PENDING_CLEAN;

    DEBUG && console.log("[runtime] update: before build");

    // Build the code
    const html = await build(fileCollection);

    DEBUG && console.log("[runtime] update: after build");

    DEBUG &&
      console.log(
        "[runtime] html: ",
        html?.substring(0, 200),
      );

    iframe.srcdoc = html || "";

    // TypeScript can't comprehend that `state`
    // may change during the await calls above.
    // @ts-ignore
    if (state === PENDING_DIRTY) {
      requestAnimationFrame(() => update(fileCollection));
      state = ENQUEUED;
    } else {
      state = IDLE;
    }
  };

  // Handle code changes
  let lastFileCollection: FileCollection | null = null;
  const run = ({
    files,
    hotReload = false,
    sourcemap = false,
  }: {
    files: FileCollection;
    hotReload?: boolean;
    sourcemap?: boolean;
  }) => {
    DEBUG && console.log("[runtime] run");
    if (files) {
      lastFileCollection = files;
    } else if (!lastFileCollection) {
      return; // No files to process
    }

    if (state === IDLE) {
      DEBUG && console.log("[runtime] run: IDLE");
      state = ENQUEUED;
      update(lastFileCollection);
    } else if (state === PENDING_CLEAN) {
      DEBUG && console.log("[runtime] run: PENDING_CLEAN");
      state = PENDING_DIRTY;
    }
  };

  // Invalidate the viz cache for changed vizzes
  const invalidateVizCache = async (
    changedVizIds: Array<VizId>,
  ): Promise<void> => {
    const requestId = generateRequestId();
    return new Promise<void>((resolve) => {
      const invalidateListener = (e: MessageEvent) => {
        if (
          e.data.type === "invalidateVizCacheResponse" &&
          e.data.requestId === requestId
        ) {
          worker.removeEventListener(
            "message",
            invalidateListener,
          );
          resolve();
        }
      };
      worker.addEventListener(
        "message",
        invalidateListener,
      );

      worker.postMessage({
        type: "invalidateVizCacheRequest",
        changedVizIds,
        requestId,
      });
    });
  };

  return {
    run,
    invalidateVizCache,
    cleanup,
  };
};
