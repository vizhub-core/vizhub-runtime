import { FileCollection } from "@vizhub/viz-types";
import {
  dependencies,
  getConfiguredLibraries,
  dependencySource,
} from "../common/packageJson.js";

/**
 * Generate an import map for all dependencies
 */
export const generateImportMap = (
  files: FileCollection,
): string | null => {
  const deps = dependencies(files);
  if (Object.keys(deps).length === 0) return null;

  const libraries = getConfiguredLibraries(files);
  const imports: Record<string, string> = {};

  for (const [name, version] of Object.entries(deps)) {
    imports[name] = dependencySource(
      { name, version },
      libraries,
    );
  }
  return JSON.stringify({ imports }, null, 2);
};
