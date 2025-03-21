import { FileCollection } from "magic-sandbox";
import { computeBundleJS } from "./computeBundleJS";
import type { RollupBuild, RollupOptions } from "rollup";

export const v2Build = async ({
  files,
  rollup,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
}): Promise<FileCollection> => ({
  ...files,
  "bundle.js": await computeBundleJS({ files, rollup }),
});
