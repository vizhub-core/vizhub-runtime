import { getFileText } from "@vizhub/viz-utils";
import {
  FileCollection,
  VizContent,
  VizId,
} from "@vizhub/viz-types";
import {
  BuildWorkerMessage,
  VizHubRuntime,
  BuildResult, // Add BuildResult
  WindowMessage, // Add WindowMessage
} from "./types";
import { generateSrcdoc } from "./generateSrcdoc"; // Import srcdoc generator

// Flag for debugging.
const DEBUG = true; // Enable debug logging for testing

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
  let isInitialLoad = true;
  let currentFileCollection: FileCollection | null = null;
  let currentOptions: {
    hot?: boolean;
    sourcemap?: boolean;
  } = { hot: true, sourcemap: true };
  let previousCSSFiles: Array<string> = [];

  // Pending promise resolver for hot reloads
  let pendingRunPromise: (() => void) | null = null;

  // This runs when the build worker sends a message.
  const workerListener = (event: MessageEvent) => {
    const data = event.data as BuildWorkerMessage;

    DEBUG &&
      console.log(
        "[runtime] received worker message:",
        data,
      );

    if (data.type === "buildResponse") {
      // Renamed from buildHTMLResponse
      const buildResult: BuildResult | undefined =
        data.buildResult;
      const error: Error | undefined = data.error;

      if (error) {
        DEBUG &&
          console.error("[runtime] Build Error:", error);
        setBuildErrorMessage &&
          setBuildErrorMessage(error.message);
        // TODO: Consider how to handle state/promises on error
        return;
      }

      if (buildResult) {
        setBuildErrorMessage && setBuildErrorMessage(null);

        const { src, cssFiles } = buildResult;

        if (
          currentOptions.hot &&
          !isInitialLoad &&
          iframe.contentWindow
        ) {
          DEBUG &&
            console.log("[runtime] Hot reloading JS/CSS");

          // --- Handle CSS ---
          const currentCSSFiles = new Set(cssFiles);
          const previousCSSFilesSet = new Set(
            previousCSSFiles,
          );

          // Inject new/changed CSS
          for (const cssFile of cssFiles) {
            // TODO: Only inject if changed? Need content hash?
            // For now, always re-inject.
            const { vizId: fileVizId, fileName } =
              parseId(cssFile); // Assuming parseId exists/is imported

            // Fetch CSS content (needs access to getLatestContent)
            if (getLatestContent) {
              getLatestContent(
                fileVizId || (vizId as VizId),
              ) // Fallback to current vizId if needed
                .then((content) => {
                  const cssSrc = getFileText(
                    content,
                    fileName,
                  );
                  if (
                    cssSrc !== null &&
                    iframe.contentWindow
                  ) {
                    const runCSSMessage: WindowMessage = {
                      type: "runCSS",
                      id: cssFile,
                      src: cssSrc,
                    };
                    DEBUG &&
                      console.log(
                        "[runtime] Sending runCSS:",
                        runCSSMessage,
                      );
                    iframe.contentWindow.postMessage(
                      runCSSMessage,
                      window.location.origin,
                    );
                  } else {
                    console.warn(
                      `[runtime] CSS file not found or empty: ${cssFile}`,
                    );
                  }
                })
                .catch((err) =>
                  console.error(
                    `[runtime] Error fetching CSS content for ${cssFile}:`,
                    err,
                  ),
                );
            } else {
              console.warn(
                "[runtime] getLatestContent not provided, cannot hot reload CSS imports.",
              );
            }
          }

          // Remove old CSS
          for (const cssFile of previousCSSFiles) {
            if (
              !currentCSSFiles.has(cssFile) &&
              iframe.contentWindow
            ) {
              const removeCSSMessage: WindowMessage = {
                type: "runCSS",
                id: cssFile,
                src: "",
              };
              DEBUG &&
                console.log(
                  "[runtime] Sending remove CSS:",
                  removeCSSMessage,
                );
              iframe.contentWindow.postMessage(
                removeCSSMessage,
                window.location.origin,
              );
            }
          }
          previousCSSFiles = cssFiles; // Update tracked CSS files

          // --- Handle JS ---
          // Set pendingRunPromise before sending runJS
          pendingRunPromise = () => {
            DEBUG &&
              console.log(
                "[runtime] Hot reload run completed.",
              );
            // Resolve any promises waiting for the run here if needed
          };

          const runJSMessage: WindowMessage = {
            type: "runJS",
            src,
          };
          DEBUG && console.log("[runtime] Sending runJS");
          iframe.contentWindow.postMessage(
            runJSMessage,
            window.location.origin,
          );
        } else {
          DEBUG &&
            console.log(
              "[runtime] Setting srcdoc (initial load or hot=false)",
            );
          // Initial load or hot reload disabled: set srcdoc
          const srcdoc = generateSrcdoc({
            js: src,
            cssFiles,
            getFileContent: async (fileId) => {
              // Basic implementation to get file content for srcdoc generation
              // Assumes fileId format like "vizId/fileName" or just "fileName"
              const { vizId: fileVizId, fileName } =
                parseId(fileId);
              if (getLatestContent) {
                try {
                  const content = await getLatestContent(
                    fileVizId || (vizId as VizId),
                  );
                  return getFileText(content, fileName);
                } catch (err) {
                  console.error(
                    `[runtime] Error getting content for srcdoc: ${fileId}`,
                    err,
                  );
                  return null;
                }
              }
              return null;
            },
          });
          iframe.srcdoc = srcdoc;
          isInitialLoad = false;
          previousCSSFiles = cssFiles; // Update tracked CSS files
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
      reload();
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
    // Reset state if needed
    isInitialLoad = true;
    currentFileCollection = null;
    previousCSSFiles = [];
  };

  // We need parseId, let's define a simple version here or import it
  // Assuming it splits 'vizId/fileName' or handles just 'fileName'
  const parseId = (
    fileId: string,
  ): { vizId?: VizId; fileName: string } => {
    const parts = fileId.split("/");
    if (parts.length > 1) {
      return {
        vizId: parts[0],
        fileName: parts.slice(1).join("/"),
      };
    }
    return { fileName: fileId };
  };

  // Handle code changes
  const reload = (
    fileCollection?: FileCollection,
    newFileCollection?: FileCollection,
    options: {
      hot?: boolean;
      sourcemap?: boolean;
    } = { hot: true, sourcemap: true },
  ) => {
    DEBUG && console.log("[runtime] reload called");

    if (newFileCollection) {
      currentFileCollection = newFileCollection;
    } else if (!currentFileCollection) {
      console.warn(
        "[runtime] reload called without files and no previous files available.",
      );
      return; // No files to process
    }

    // Store options for use in the response handler
    currentOptions = options;

    // Always send a build request to the worker
    DEBUG &&
      console.log(
        "[runtime] Sending buildRequest to worker",
      );
    const message: BuildWorkerMessage = {
      type: "buildRequest", // Renamed from buildHTMLRequest
      fileCollection: currentFileCollection,
      vizId,
      enableSourcemap: options.sourcemap ?? true,
    };
    worker.postMessage(message);

    // Note: Removed the state machine (IDLE, PENDING etc.) for simplicity.
    // The logic now directly triggers a build on reload.
    // Re-introducing debouncing/throttling might be needed for rapid changes.
  };

  // Invalidate the viz cache for changed vizzes
  const invalidateVizCache = async (
    changedVizIds: Array<VizId>,
  ): Promise<void> => {
    return new Promise<void>((resolve) => {
      const invalidateListener = (e: MessageEvent) => {
        if (e.data.type === "invalidateVizCacheResponse") {
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
      });
    });
  };

  return {
    reload,
    invalidateVizCache,
    cleanup,
  };
};
