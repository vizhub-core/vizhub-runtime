import "./style.css";
import {
  createRuntime,
  VizHubRuntime,
} from "@vizhub/runtime";
import BuildWorker from "./buildWorker?worker";
import { demoButtons } from "./demoButtons";

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
  setBuildErrorMessage: (message) => {
    console.error("Build error:", message);
  },
});

// Expose runtime on the parent window for testing
window.runtime = runtime;

demoButtons(runtime);
