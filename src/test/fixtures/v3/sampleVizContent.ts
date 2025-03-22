import { VizContent } from "@vizhub/viz-types";

// Sample content for testing JS imports
export const sampleVizContent: VizContent = {
  id: "84bddfb1cc0545f299e5083c3e71e0bb",
  files: {
    "7548392": {
      name: "index.js",
      text: `
        import { innerMessage } from './message';
        export const message = "Outer " + innerMessage;
      `,
    },
    "6714854": {
      name: "message.js",
      text: `
        export const innerMessage = "Inner";
      `,
    },
  },
  title: "Sample Content for Exporting",
};
