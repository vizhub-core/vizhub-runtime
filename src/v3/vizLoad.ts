import { InputPluginOption } from "rollup";
import {
  FileCollection,
  VizContent,
  VizId,
} from "@vizhub/viz-types";
import { getFileText } from "@vizhub/viz-utils";
import type { ResolvedVizFileId } from "./types";
import { parseId } from "./parseId";
import { VizCache } from "./vizCache.js";

const debug = false;

// Responsible for loading all imports and
// tracking which CSS files are imported.
// Throws an error if a file is imported but not found.
export const vizLoad = ({
  vizCache,
  trackCSSImport,
  vizId,
  files,
}: {
  vizCache: VizCache;
  trackCSSImport: (cssFile: ResolvedVizFileId) => void;
  vizId?: VizId;
  files?: FileCollection;
}): InputPluginOption => ({
  name: "vizLoad",

  // `id` here is of the form
  // `{vizId}/{fileName}`
  load: async (id: ResolvedVizFileId) => {
    if (debug) {
      console.log("[vizLoadCSS]: load() " + id);
    }

    const parsedId = parseId(id);
    const parsedVizId = parsedId.vizId;
    const parsedFileName = parsedId.fileName;

    if (debug) {
      console.log("  [vizLoadCSS] vizId: " + parsedVizId);
      console.log(
        "  [vizLoadCSS] fileName: " + parsedFileName,
      );
    }

    // For CSS imports, all we need to do here is
    // keep track of them so they can be injected
    // into the IFrame later.
    if (parsedFileName.endsWith(".css")) {
      if (debug) {
        console.log(
          "    [vizResolve] tracking CSS import for " + id,
        );
      }
      // The import is tracked here so that it can be
      // injected into the IFrame later, external to the
      // Rollup build.
      trackCSSImport(id);
      // TODO consider using Rollup's `emitFile` to emit a CSS file.
      return "";
    }

    // If we are resolving to the root vizId, we can
    // use the files object directly.
    // Otherwise, we need to get the content from the vizCache.
    // This makes it so the vizCache is _only_ used for
    // resolving cross-viz imports.
    let fileText: string | null = null;
    if (parsedVizId === vizId && files) {
      fileText = files[parsedFileName] || null;
    } else {
      const content = await vizCache.get(parsedVizId);
      fileText = getFileText(content, parsedFileName);
    }

    // If a file is imported but not found, throw an error.
    if (fileText === null) {
      throw new Error(
        `Imported file "${parsedFileName}" not found.`,
      );
      // TODO ideally show username/slug instead of vizId
      // `Imported file "${fileName}" not found in viz ${vizId}`,
      // `Imported file "${fileName}" not found.`,
      // );
    }

    return fileText;
  },
});
