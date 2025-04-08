import { VizContent } from "@vizhub/viz-types";
import { vizFilesToFileCollection } from "@vizhub/viz-utils";

// Flag for debugging.
const debug = false;

export type VizHubRuntime = {
  // Resets the iframe srcdoc when code changes.
  handleCodeChange: (content: VizContent) => void;
  // Cleans up the event listener from the Worker.
  cleanup: () => void;
};

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

  const handleCodeChange = (content: VizContent) => {
    if (debug) {
      console.log("[v2 runtime] handleCodeChange");
    }

    // Simply reset the srcdoc when code changes
    const message = {
      type: "buildHTMLRequest",
      files: vizFilesToFileCollection(content?.files),
    };
    worker.postMessage(message);
  };

  return {
    handleCodeChange,
    cleanup,
  };
};
