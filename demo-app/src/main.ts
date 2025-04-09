import "./style.css";
import {
  createRuntime,
  createVizContent,
  VizHubRuntime,
} from "@vizhub/runtime";
import BuildWorker from "./buildWorker?worker";
import { demoButtons } from "./demoButtons";
import { fixtures } from "./fixtures";
import { VizContent, VizId } from "@vizhub/viz-types";

const vizContentsArray = fixtures.map(
  ({ label, files, status }) => {
    return {
      label,
      status,
      vizContent: createVizContent(files),
    };
  },
);

const vizContentsMap = new Map<VizId, VizContent>(
  vizContentsArray.map(({ vizContent }) => [
    vizContent.id,
    vizContent,
  ]),
);

// Get the iframe from the DOM
const iframe = document.getElementById(
  "viz-iframe",
) as HTMLIFrameElement;

// Initialize the worker
const worker = new BuildWorker();

// Create the runtime in the iframe context
const runtime: VizHubRuntime = createRuntime({
  iframe,
  worker,
  getLatestContent: async (vizId) => {
    const content = vizContentsMap.get(vizId);
    if (!content) {
      throw new Error(
        `No content found for vizId: ${vizId}`,
      );
    }
    return content;
  },
  setBuildErrorMessage: (message) => {
    // TODO get this error to show up correctly
    console.error("Build error:", message);
  },
});

// Expose runtime on the parent window for testing
window.runtime = runtime;

demoButtons(runtime, vizContentsArray);
