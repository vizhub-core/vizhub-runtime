import { RollupBuild, RollupOptions } from "rollup";
import { getFileText } from "@vizhub/viz-utils";
import { computeBundleJSV3 } from "./computeBundleJSV3";
import { htmlTemplate } from "./htmlTemplate";
import { VizCache } from "./vizCache.js";
import { FileCollection, VizId } from "@vizhub/viz-types";
import { parseId } from "./parseId.js";
import { ResolvedVizFileId } from "./types.js";
import { SlugCache } from "./slugCache.js";
import { SvelteCompiler } from "./transformSvelte.js";

export const v3Build = async ({
  files,
  rollup,
  enableSourcemap = true,
  vizCache,
  vizId,
  slugCache,
  getSvelteCompiler,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
  vizCache: VizCache;
  vizId: VizId;
  slugCache?: SlugCache;
  getSvelteCompiler?: () => Promise<SvelteCompiler>;
}): Promise<string> => {
  const { src, cssFiles } = await computeBundleJSV3({
    files,
    rollup,
    enableSourcemap,
    vizCache,
    vizId,
    slugCache,
    getSvelteCompiler,
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
