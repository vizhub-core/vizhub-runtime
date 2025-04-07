import type { RollupBuild, RollupOptions } from "rollup";
import { FileCollection } from "@vizhub/viz-types";
import { getComputedIndexHtml } from "./getComputedIndexHtml.js";
import { computeBundleJSV2 } from "./computeBundleJSV2.js";

export const v2Build = async ({
  files,
  rollup,
  enableSourcemap,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
}): Promise<FileCollection> => ({
  ...files,
  "bundle.js": await computeBundleJSV2({
    files,
    rollup,
    enableSourcemap,
  }),
  "index.html": getComputedIndexHtml(files),
});
