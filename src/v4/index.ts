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
  const { entryPoints, inlineScripts } = extractModuleEntryPoints(html);

  if (entryPoints.length === 0) {
    DEBUG &&
      console.log("[v4Build] No module entry points found");
    return files; // nothing to bundle
  }

  // Add inline scripts to the files collection
  const extendedFiles = { ...files };
  for (const inlineScript of inlineScripts) {
    extendedFiles[inlineScript.id] = inlineScript.content;
  }

  const bundled = new Map<string, string>();
  for (const entry of entryPoints) {
    const code = await bundleESModule({
      entryPoint: entry,
      files: extendedFiles,
      rollup,
      enableSourcemap,
    });
    bundled.set(entry, code);
  }

  const updatedHTML = updateHTML(extendedFiles, bundled, inlineScripts, false);

  return {
    ...files,
    "index.html": updatedHTML,
  };
};

/**
 * Build for v4 runtime with hot reloading support
 * Returns both HTML and separate JS for hot reloading
 */
export const v4BuildWithHotReload = async ({
  files,
  rollup,
  enableSourcemap = true,
}: {
  files: FileCollection;
  rollup: (o: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
}): Promise<{ files: FileCollection; bundledJS: string }> => {
  const html = files["index.html"] || "";
  const { entryPoints, inlineScripts } = extractModuleEntryPoints(html);

  if (entryPoints.length === 0) {
    DEBUG &&
      console.log("[v4BuildWithHotReload] No module entry points found");
    return { files, bundledJS: "" };
  }

  // Add inline scripts to the files collection
  const extendedFiles = { ...files };
  for (const inlineScript of inlineScripts) {
    extendedFiles[inlineScript.id] = inlineScript.content;
  }

  const bundled = new Map<string, string>();
  const allBundledCode: string[] = [];
  
  for (const entry of entryPoints) {
    const code = await bundleESModule({
      entryPoint: entry,
      files: extendedFiles,
      rollup,
      enableSourcemap,
    });
    bundled.set(entry, code);
    allBundledCode.push(code);
  }

  const updatedHTML = updateHTML(extendedFiles, bundled, inlineScripts, true);

  // Concatenate all bundled JS for hot reloading
  const bundledJS = allBundledCode.join('\n');

  return {
    files: {
      ...files,
      "index.html": updatedHTML,
    },
    bundledJS,
  };
};

// Export the extractModuleEntryPoints function for external use
export { extractModuleEntryPoints };
