import { RollupBuild, RollupOptions } from "rollup";
import { FileCollection } from "../types";
import { computeBundleJSV3 } from "./computeBundleJSV3";
import { htmlTemplate } from "./htmlTemplate";
import { VizCache } from "./vizCache";
import { VizId } from "@vizhub/viz-types";

export const v3Build = async ({
  files,
  rollup,
  enableSourcemap = true,
  vizCache,
  vizId,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
  vizCache: VizCache;
  vizId: VizId;
}): Promise<string> => {
  const { src, cssFiles } = await computeBundleJSV3({
    files,
    rollup,
    enableSourcemap,
    vizCache,
    vizId,
  });

  // Generate CSS styles from imported CSS files
  let styles = "";
  for (const cssFile of cssFiles) {
    if (files[cssFile]) {
      styles += `<style>${files[cssFile]}</style>`;
    }
  }

  return htmlTemplate({ cdn: "", src, styles });
};
