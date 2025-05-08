import { FileCollection } from "@vizhub/viz-types";
import type { Plugin } from "rollup";

export const VIRTUAL_PREFIX = "\0virtual:";

const normalizePath = (filepath: string): string => {
  // Remove leading ./
  let normalized = filepath.replace(/^\.\//, "");
  // Replace multiple slashes with single slash
  normalized = normalized.replace(/\/+/g, "/");
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, "");
  return normalized;
};

const joinPaths = (
  base: string,
  relative: string,
): string => {
  // Get directory name of base path
  const baseDir = base.includes("/")
    ? base.slice(0, base.lastIndexOf("/"))
    : "";

  // Handle .. by removing one directory level
  const parts = relative.split("/");
  const resultParts: string[] = baseDir
    ? baseDir.split("/")
    : [];

  for (const part of parts) {
    if (part === "..") {
      resultParts.pop();
    } else if (part !== "." && part !== "") {
      resultParts.push(part);
    }
  }

  return resultParts.join("/");
};

export const virtualFileSystem = (
  files: FileCollection,
): Plugin => {
  return {
    name: "virtual-file-system",

    resolveId(source: string, importer?: string) {
      // Strip prefix from importer if present
      const cleanImporter = importer?.startsWith(
        VIRTUAL_PREFIX,
      )
        ? importer.slice(VIRTUAL_PREFIX.length)
        : importer;

      // Handle relative paths
      if (
        source.startsWith("./") ||
        source.startsWith("../")
      ) {
        const resolvedPath = cleanImporter
          ? normalizePath(joinPaths(cleanImporter, source))
          : normalizePath(source);

        // Try exact match first
        if (files[resolvedPath]) {
          return {
            id: VIRTUAL_PREFIX + resolvedPath,
            moduleSideEffects: false,
            // Explicitly mark as ES module to ensure proper scope handling
            syntheticNamedExports: true,
            // Force module to be treated as external to preserve its scope
            external: false,
            // Add a unique namespace to each module
            meta: {
              moduleId: resolvedPath
            }
          };
        }

        // Try with extensions if no exact match is found
        const extensions = [".js", ".jsx", ".ts", ".tsx"];
        for (const ext of extensions) {
          const pathWithExt = resolvedPath + ext;
          if (files[pathWithExt]) {
            return {
              id: VIRTUAL_PREFIX + pathWithExt,
              moduleSideEffects: false,
              // Explicitly mark as ES module to ensure proper scope handling
              syntheticNamedExports: true,
              // Force module to be treated as external to preserve its scope
              external: false,
              // Add a unique namespace to each module
              meta: {
                moduleId: pathWithExt
              }
            };
          }
        }
      }

      // Handle bare module imports
      if (files[source]) {
        return {
          id: VIRTUAL_PREFIX + source,
          moduleSideEffects: false,
          // Explicitly mark as ES module to ensure proper scope handling
          syntheticNamedExports: true,
          // Force module to be treated as external to preserve its scope
          external: false,
          // Add a unique namespace to each module
          meta: {
            moduleId: source
          }
        };
      }

      // Try bare imports with extensions
      const extensions = [".js", ".jsx", ".ts", ".tsx"];
      for (const ext of extensions) {
        const pathWithExt = source + ext;
        if (files[pathWithExt]) {
          return {
            id: VIRTUAL_PREFIX + pathWithExt,
            moduleSideEffects: false,
            // Explicitly mark as ES module to ensure proper scope handling
            syntheticNamedExports: true,
            // Force module to be treated as external to preserve its scope
            external: false,
            // Add a unique namespace to each module
            meta: {
              moduleId: pathWithExt
            }
          };
        }
      }

      return null;
    },

    load(id: string) {
      console.log("Loading file:", id);
      // Only handle our virtual-prefixed IDs
      if (id.startsWith(VIRTUAL_PREFIX)) {
        const actualId = id.slice(VIRTUAL_PREFIX.length);
        if (files[actualId]) {
          // Return the file content with metadata
          return {
            code: files[actualId],
            // Explicitly tell Rollup this is an ES module
            moduleSideEffects: false,
            syntheticNamedExports: true,
            // Add module metadata to help with scope preservation
            meta: {
              moduleId: actualId
            }
          };
        }
      }
      return null;
    },
  };
};
