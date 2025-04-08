import { FileCollection } from "@vizhub/viz-types";

// export type FileCollection = Record<string, string>;
export type runtimeVersion = "v1" | "v2" | "v3" | "v4";

export type VizHubRuntime = {
  // Resets the iframe srcdoc when code changes.
  handleCodeChange: (
    fileCollection: FileCollection,
  ) => void;
  // Cleans up the event listener from the Worker.
  cleanup: () => void;
};

export type BuildWorkerMessage =
  // `buildHTMLRequest`
  //  * Sent from the main thread to the worker.
  //  * When the main thread wants to build the HTML for the iframe.
  | {
      type: "buildHTMLRequest";
      fileCollection: FileCollection;
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
    };
