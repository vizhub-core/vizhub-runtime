import type { RollupBuild, RollupOptions } from "rollup";
import { FileCollection } from "@vizhub/viz-types";
import { extractModuleEntryPoints } from "./extractEntryPoints.js";
import { bundleESModule } from "./bundleModule.js";
import { updateHTML } from "./updateHTML.js";

const DEBUG = false;

/**
 * Build for v4 runtime
 */
export const v4Build = async ({
  files,
  rollup,
  enableSourcemap = true,
}: {
  files: FileCollection;
  rollup: (o: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
}): Promise<FileCollection> => {
  const html = files["index.html"] || "";
  const entryPoints = extractModuleEntryPoints(html);

  if (entryPoints.length === 0) {
    DEBUG &&
      console.log("[v4Build] No module entry points found");
    return files; // nothing to bundle
  }

  const bundled = new Map<string, string>();
  for (const entry of entryPoints) {
    const code = await bundleESModule({
      entryPoint: entry,
      files,
      rollup,
      enableSourcemap,
    });
    bundled.set(entry, code);
  }

  const updatedHTML = updateHTML(files, bundled);

  return {
    ...files,
    "index.html": updatedHTML,
  };
};

// Export the extractModuleEntryPoints function for external use
export { extractModuleEntryPoints };
