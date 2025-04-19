import { FileCollection, VizId } from "@vizhub/viz-types";

export type VizHubRuntimeFixture = {
  // Label for button
  label: string;
  status: "working" | "failing";
  files: FileCollection;

  // For testing V3 cross-viz imports only
  slugKey?: string;
  vizId?: VizId;
};

// label: "D3 Demo (v3)",
// status: "working",
// slug: "joe/d3-demo-v3",
// id: "c47442fcde4347da829d0be529974fcf",
