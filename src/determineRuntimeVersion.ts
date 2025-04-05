import { FileCollection } from "@vizhub/viz-types";
import { runtimeVersion } from "./types";

export const determineRuntimeVersion = (
  files: FileCollection,
): runtimeVersion | null => {
  if (Object.keys(files).length === 0) {
    return null;
  }

  const hasIndexHTML = "index.html" in files;

  const hasIndexJS = "index.js" in files;
  const hasIndexJSX = "index.jsx" in files;

  if (hasIndexHTML) {
    const hasModuleScript =
      files["index.html"].includes('type="module"');
    if (hasModuleScript) {
      return "v4";
    }

    if (hasIndexJS || hasIndexJSX) {
      return "v2";
    }
    return "v1";
  }

  if (!hasIndexHTML && hasIndexJS) {
    return "v3";
  }

  return null;
};
