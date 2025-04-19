import "./style.css";
import {
  createRuntime,
  createVizContent,
  VizHubRuntime,
} from "@vizhub/runtime";
import BuildWorker from "./buildWorker?worker";
import { demoButtons } from "./demoButtons";
import { fixtures } from "./fixtures";

// const vizContentsArray = fixtures.map(
//   ({ label, files, status, id }) => {
//     return {
//       label,
//       status,
//       vizContent: createVizContent(files),
//     };
//   },
// );

// const vizContentsMap = new Map<VizId, VizContent>(
//   vizContentsArray.map(({ vizContent }) => [
//     vizContent.id,
//     vizContent,
//   ]),
// );

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
  resolveSlugKey: async (slugKey: string) => {
    const fixture = fixtures.find(
      (fixture) => fixture.slugKey === slugKey,
    );
    if (!fixture || !fixture.vizId) {
      return null;
    }
    return fixture.vizId;
  },
  getLatestContent: async (vizId) => {
    const fixture = fixtures.find(
      (fixture) => fixture.vizId === vizId,
    );
    if (!fixture) {
      return null;
    }
    return createVizContent(
      fixture.files,
      fixture.label,
      fixture.vizId,
    );
  },
  setBuildErrorMessage: (message) => {
    message && console.error("Build error:", message);
  },
});

// Expose runtime on the parent window for testing
window.runtime = runtime;

demoButtons(runtime, fixtures);
