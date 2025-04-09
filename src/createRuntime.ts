import {
  FileCollection,
  VizContent,
  VizId,
} from "@vizhub/viz-types";
import { BuildWorkerMessage, VizHubRuntime } from "./types";
import { createSlugCache } from "./v3/slugCache";

// Flag for debugging.
const DEBUG = true;

// State constants
const IDLE = "IDLE";
const ENQUEUED = "ENQUEUED";
const PENDING_CLEAN = "PENDING_CLEAN";
const PENDING_DIRTY = "PENDING_DIRTY";

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

  // Create a slug cache that's backed by the main thread
  const slugCache = createSlugCache({
    initialMappings: {},
    handleCacheMiss: async (slug) => {
      if (!resolveSlugKey) {
        throw new Error(
          `Unresolved slug ${slug}, cache miss handler not provided.`,
        );
      }

      return resolveSlugKey(slug);
    },
  });

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

        // Reset the srcdoc
        if (html) {
          iframe.srcdoc = html;
        }
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
    } else if (data.type === "invalidateVizCacheResponse") {
      if (DEBUG) {
        console.log(
          "[runtime] received invalidateVizCacheResponse",
        );
      }
      // Trigger a code change to rebuild
      handleCodeChange();
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

    DEBUG && console.log("[runtime] html: ", html);

    // iframe.srcdoc = html || "";

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
  const handleCodeChange = (
    fileCollection?: FileCollection,
  ) => {
    DEBUG && console.log("[runtime] handleCodeChange");
    if (fileCollection) {
      lastFileCollection = fileCollection;
    } else if (!lastFileCollection) {
      return; // No files to process
    }

    if (state === IDLE) {
      DEBUG &&
        console.log("[runtime] handleCodeChange: IDLE");
      state = ENQUEUED;
      update(lastFileCollection);
    } else if (state === PENDING_CLEAN) {
      DEBUG &&
        console.log(
          "[runtime] handleCodeChange: PENDING_CLEAN",
        );
      state = PENDING_DIRTY;
    }
  };

  // Invalidate the viz cache for changed vizzes
  const invalidateVizCache = (
    changedVizIds: Array<VizId>,
  ): void => {
    worker.postMessage({
      type: "invalidateVizCacheRequest",
      changedVizIds,
    });
  };

  // Reset the srcdoc and runtime environment
  const resetSrcdoc = (changedVizIds: Array<VizId>) => {
    state = IDLE;
    pendingBuildPromise = null;
    pendingRunPromise = null;

    if (vizId) {
      worker.postMessage({
        type: "resetSrcdocRequest",
        vizId,
        changedVizIds,
      });
    }
  };

  return {
    handleCodeChange,
    invalidateVizCache,
    resetSrcdoc,
    cleanup,
  };
};
