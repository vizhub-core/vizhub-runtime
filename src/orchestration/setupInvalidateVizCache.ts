import { VizId } from "@vizhub/viz-types";
import { generateRequestId } from "./generateRequestId";

export const setupInvalidateVizCache =
  (worker: Worker) =>
  async (changedVizIds: Array<VizId>): Promise<void> => {
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
