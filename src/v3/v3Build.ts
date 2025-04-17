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
import {
  dependencies,
  getConfiguredLibraries,
  dependencySource,
} from "../common/packageJson";
import { BuildResult } from "../build/types";

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
}): Promise<BuildResult> => {
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
  let cssFileTextArray: string[] = [];

  // Inject CSS files.
  if (cssFiles.length > 0) {
    for (let i = 0; i < cssFiles.length; i++) {
      const id: ResolvedVizFileId = cssFiles[i];
      const { vizId, fileName } = parseId(id);
      const content = await vizCache.get(vizId);
      const cssFileText = getFileText(content, fileName);
      if (cssFileText) {
        cssFileTextArray.push(cssFileText);
      }
    }
  }

  // The concatenated CSS text.
  const css = cssFileTextArray.join("\n");

  const styles = `\n    <style id="injected-style">${css}</style>`;
  // Generate CDN script tags for dependencies
  let cdn = "";
  const deps: [string, string][] = Object.entries(
    dependencies(files),
  );
  if (deps.length > 0) {
    const libraries = getConfiguredLibraries(files);
    cdn = deps
      .map(([name, version], i) => {
        const dependencySrc = dependencySource(
          { name, version },
          libraries,
        );
        const indent = i > 0 ? "    " : "\n    ";
        return `${indent}<script src="${dependencySrc}"></script>`;
      })
      .join("");
  }

  return {
    html: htmlTemplate({ cdn, src, styles }),
    css,
    js: src,
  };
};
