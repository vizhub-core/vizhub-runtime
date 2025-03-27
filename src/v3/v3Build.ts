import { RollupBuild, RollupOptions } from "rollup";
import { FileCollection } from "../types";
import { computeBundleJSV3 } from "./computeBundleJSV3";
import { htmlTemplate } from "./htmlTemplate";
import { VizCache } from "./vizCache";
import { VizId } from "@vizhub/viz-types";
import { parseId } from "./parseId";
import { getFileText } from "../utils/getFileText";
import { ResolvedVizFileId } from "./types";

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

  // Inject CSS files.
  if (cssFiles.length > 0) {
    for (let i = 0; i < cssFiles.length; i++) {
      const id: ResolvedVizFileId = cssFiles[i];
      const indent = i > 0 ? "    " : "\n    ";
      const styleElementId = "injected-style" + id;
      const { vizId, fileName } = parseId(id);
      const content = await vizCache.get(vizId);
      const src = getFileText(content, fileName);
      styles += `${indent}<style id="${styleElementId}">${src}</style>`;
    }
  }

  return htmlTemplate({ cdn: "", src, styles });
};
