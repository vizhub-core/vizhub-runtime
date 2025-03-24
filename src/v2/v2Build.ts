import { FileCollection } from "magic-sandbox";
import type { RollupBuild, RollupOptions } from "rollup";
import { getComputedIndexHtml } from "./getComputedIndexHtml";
import { computeBundleJSV2 } from "./computeBundleJSV2";

export const v2Build = async ({
  files,
  rollup,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
}): Promise<FileCollection> => ({
  ...files,
  "bundle.js": await computeBundleJSV2({ files, rollup }),
  "index.html": getComputedIndexHtml(files),
});
