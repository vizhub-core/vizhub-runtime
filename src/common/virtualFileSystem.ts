import { FileCollection } from "@vizhub/viz-types";
import type { Plugin } from "rollup";
import {
  isImageFile,
  convertImageToDataURL,
} from "./imageSupport";

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
          return VIRTUAL_PREFIX + resolvedPath;
        }

        // Try with extensions if no exact match is found
        const extensions = [".js", ".jsx", ".ts", ".tsx"];
        for (const ext of extensions) {
          const pathWithExt = resolvedPath + ext;
          if (files[pathWithExt]) {
            return VIRTUAL_PREFIX + pathWithExt;
          }
        }
      }

      // Handle bare module imports
      if (files[source]) {
        return VIRTUAL_PREFIX + source;
      }

      // Try bare imports with extensions
      const extensions = [".js", ".jsx", ".ts", ".tsx"];
      for (const ext of extensions) {
        const pathWithExt = source + ext;
        if (files[pathWithExt]) {
          return VIRTUAL_PREFIX + pathWithExt;
        }
      }

      return null;
    },

    load(id: string) {
      // Only handle our virtual-prefixed IDs
      if (id.startsWith(VIRTUAL_PREFIX)) {
        const actualId = id.slice(VIRTUAL_PREFIX.length);
        if (files[actualId]) {
          // Handle image files by returning them as data URL exports
          if (isImageFile(actualId)) {
            const dataURL = convertImageToDataURL(
              actualId,
              files[actualId],
            );
            return `export default "${dataURL}";`;
          }
          // Handle regular files
          return files[actualId];
        }
      }
      return null;
    },
  };
};
