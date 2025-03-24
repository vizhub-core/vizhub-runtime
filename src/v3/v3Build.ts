import { RollupBuild, RollupOptions } from "rollup";
import { FileCollection } from "../types";
import { computeBundleJSV3 } from "./computeBundleJSV3";
import { htmlTemplate } from "./htmlTemplate";

export const v3Build = async ({
  files,
  rollup,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
}): Promise<string> => {
  const { src, cssFiles } = await computeBundleJSV3({
    files,
    rollup,
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
