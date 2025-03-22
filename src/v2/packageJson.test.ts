import { describe, it, expect } from "vitest";
import {
  packageJSON,
  dependencies,
  getConfiguredLibraries,
  dependencySource,
  getLicense,
} from "./packageJson";
import { FileCollection } from "../types";

describe("packageJson", () => {
  const mockFiles: FileCollection = {
    "package.json": JSON.stringify({
      dependencies: {
        react: "17.0.2",
        d3: "7.0.0",
      },
      vizhub: {
        libraries: {
          d3: { path: "/dist/d3.min.js" },
        },
      },
      license: "Apache-2.0",
    }),
  };

  const emptyFiles: FileCollection = {};
  const invalidFiles: FileCollection = {
    "package.json": "invalid json",
  };

  describe("packageJSON", () => {
    it("should parse valid package.json", () => {
      const result = packageJSON(mockFiles);
      expect(result).toHaveProperty("dependencies");
      expect(result.dependencies).toHaveProperty("react", "17.0.2");
    });

    it("should return empty object for missing package.json", () => {
      const result = packageJSON(emptyFiles);
      expect(result).toEqual({
        dependencies: {},
        vizhub: {},
        license: "MIT",
      });
    });

    it("should handle invalid JSON", () => {
      const result = packageJSON(invalidFiles);
      expect(result).toEqual({
        dependencies: {},
        vizhub: {},
        license: "MIT",
      });
    });
  });

  describe("dependencies", () => {
    it("should return dependencies from package.json", () => {
      const result = dependencies(mockFiles);
      expect(result).toEqual({
        react: "17.0.2",
        d3: "7.0.0",
      });
    });

    it("should return empty object when no dependencies", () => {
      const result = dependencies(emptyFiles);
      expect(result).toEqual({});
    });
  });

  describe("getConfiguredLibraries", () => {
    it("should return configured libraries", () => {
      const result = getConfiguredLibraries(mockFiles);
      expect(result).toEqual({
        d3: { path: "/dist/d3.min.js" },
      });
    });

    it("should return empty object when no libraries configured", () => {
      const result = getConfiguredLibraries(emptyFiles);
      expect(result).toEqual({});
    });
  });

  describe("dependencySource", () => {
    it("should generate correct URL with path", () => {
      const dependency = { name: "d3", version: "7.0.0" };
      const libraries = { d3: { path: "/dist/d3.min.js" } };
      const result = dependencySource(dependency, libraries);
      expect(result).toBe("https://unpkg.com/d3@7.0.0/dist/d3.min.js");
    });

    it("should generate correct URL without path", () => {
      const dependency = { name: "react", version: "17.0.2" };
      const libraries = {};
      const result = dependencySource(dependency, libraries);
      expect(result).toBe("https://unpkg.com/react@17.0.2");
    });
  });

  describe("getLicense", () => {
    it("should return license from package.json", () => {
      const result = getLicense(mockFiles);
      expect(result).toBe("Apache-2.0");
    });

    it("should return default MIT license when not specified", () => {
      const result = getLicense(emptyFiles);
      expect(result).toBe("MIT");
    });
  });
});
