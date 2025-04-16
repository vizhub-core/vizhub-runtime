import { FileCollection } from "@vizhub/viz-types";
import { BuildWorkerMessage } from "../types";
import { generateRequestId } from "./generateRequestId";

export const setupBuild =
  ({
    worker,
    setBuildErrorMessage,
  }: {
    worker: Worker;
    setBuildErrorMessage?: (error: string | null) => void;
  }) =>
  ({
    files,
    enableSourcemap,
  }: {
    files: FileCollection;
    enableSourcemap: boolean;
  }): Promise<string | undefined> => {
    const requestId = generateRequestId();
    return new Promise<string | undefined>((resolve) => {
      const buildListener = (e: MessageEvent) => {
        const data = e.data as BuildWorkerMessage;
        if (data.type === "buildHTMLResponse") {
          worker.removeEventListener(
            "message",
            buildListener,
          );

          const html: string | undefined = data.html;
          const error: Error | undefined = data.error;

          if (error) {
            setBuildErrorMessage?.(error.message);
          } else {
            setBuildErrorMessage?.(null);
          }

          resolve(html);
        }
      };

      worker.addEventListener("message", buildListener);

      const message: BuildWorkerMessage = {
        type: "buildHTMLRequest",
        files,
        enableSourcemap,
        requestId,
      };
      console.log("Sending message to worker:", message);
      worker.postMessage(message);
    });
  };
