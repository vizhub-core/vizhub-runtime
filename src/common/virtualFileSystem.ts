import { Plugin } from "rollup";
import { FileCollection } from "../types";

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
      // Handle relative paths
      if (
        source.startsWith("./") ||
        source.startsWith("../")
      ) {
        const resolvedPath = importer
          ? normalizePath(joinPaths(importer, source))
          : normalizePath(source);

        // Try exact match first
        if (files[resolvedPath]) {
          return resolvedPath;
        }

        // Try with extensions if no exact match is found
        const extensions = [".js", ".jsx", ".ts", ".tsx"];
        for (const ext of extensions) {
          const pathWithExt = resolvedPath + ext;
          if (files[pathWithExt]) {
            return pathWithExt;
          }
        }
      }

      // Handle bare module imports
      if (files[source]) {
        return source;
      }

      // Try bare imports with extensions
      const extensions = [".js", ".jsx", ".ts", ".tsx"];
      for (const ext of extensions) {
        const pathWithExt = source + ext;
        if (files[pathWithExt]) {
          return pathWithExt;
        }
      }

      return null;
    },

    load(id: string) {
      // Return the contents if the file exists in our virtual system
      if (files[id]) {
        return files[id];
      }

      return null;
    },
  };
};
