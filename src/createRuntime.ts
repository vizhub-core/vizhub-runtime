import { FileCollection } from "@vizhub/viz-types";
import { BuildWorkerMessage, VizHubRuntime } from "./types";

// Flag for debugging.
const DEBUG = false;

export const createRuntime = ({
  iframe,
  setBuildErrorMessage,
  worker,
}: {
  iframe: HTMLIFrameElement;
  setBuildErrorMessage: (error: string | null) => void;
  worker: Worker;
}): VizHubRuntime => {
  // This runs when the build worker sends a message.
  const listener: (e: MessageEvent) => void = ({
    data,
  }: {
    data: BuildWorkerMessage;
  }) => {
    if (data.type === "buildHTMLResponse") {
      const html: string | undefined = data.html;
      const error: Error | undefined = data.error;

      if (error) {
        setBuildErrorMessage(error.message);
      } else {
        setBuildErrorMessage(null);

        // Reset the srcdoc
        if (html) {
          iframe.srcdoc = html;
        }
      }
    }
  };
  worker.addEventListener("message", listener);
  const cleanup = () => {
    worker.removeEventListener("message", listener);
  };

  const handleCodeChange = (
    fileCollection: FileCollection,
  ) => {
    DEBUG && console.log("[v2 runtime] handleCodeChange");

    // Simply reset the srcdoc when code changes
    const message: BuildWorkerMessage = {
      type: "buildHTMLRequest",
      fileCollection,
    };
    worker.postMessage(message);
  };

  return {
    handleCodeChange,
    cleanup,
  };
};
