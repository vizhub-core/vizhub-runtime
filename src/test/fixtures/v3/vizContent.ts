import { VizContent } from "@vizhub/viz-types";
import { createVizContent } from "../../../v3/createVizContent";

// Content for testing JS imports
export const sampleVizContent: VizContent =
  createVizContent({
    "index.js": `
    import { innerMessage } from './message';
    export const message = "Outer " + innerMessage;
  `,
    "message.js": `
    export const innerMessage = "Inner";
  `,
  });
