import { FileCollection } from "@vizhub/viz-types";
import { generateRequestId } from "./generateRequestId";
import { BuildWorkerMessage } from "./types";
import { BuildResult } from "../build/types";

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
  }): Promise<BuildResult | undefined> => {
    const requestId = generateRequestId();
    return new Promise<BuildResult | undefined>(
      (resolve) => {
        const buildListener = (e: MessageEvent) => {
          const data: BuildWorkerMessage = e.data;
          if (data.type === "buildResponse") {
            worker.removeEventListener(
              "message",
              buildListener,
            );

            const buildResult: BuildResult | undefined =
              data.buildResult;
            const error: string | undefined = data.error;

            if (error) {
              setBuildErrorMessage?.(error);
            } else {
              setBuildErrorMessage?.(null);
            }

            resolve(buildResult);
          }
        };

        worker.addEventListener("message", buildListener);

        const message: BuildWorkerMessage = {
          type: "buildRequest",
          files,
          enableSourcemap,
          requestId,
        };
        worker.postMessage(message);
      },
    );
  };
