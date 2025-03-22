import { FileCollection } from "magic-sandbox";
import { RollupBuild, RollupOptions } from "rollup";

export const v3Build = async ({
  files,
  rollup,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
}) => {
  return "TODO build out v3Build";
};
