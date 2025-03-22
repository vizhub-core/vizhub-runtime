import { RollupBuild, RollupOptions } from "rollup";
import { FileCollection } from "../types";
import { computeBundleJS } from "./computeBundleJS";

export const v3Build = async ({
  files,
  rollup,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
}): Promise<string> => {
  const bundleJS = await computeBundleJS({ files, rollup });
  return bundleJS;
};
