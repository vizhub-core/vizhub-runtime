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
    it("should generate correct URL with path - jsdelivr", () => {
      const dependency = { name: "d3", version: "7.0.0" };
      const libraries = { d3: { path: "/dist/d3.min.js" } };
      const result = dependencySource(dependency, libraries);
      expect(result).toBe(
        "https://cdn.jsdelivr.net/npm/d3@7.0.0/dist/d3.min.js"
      );
    });

    it("should generate correct URL without path - jsdelivr", () => {
      const dependency = { name: "react", version: "17.0.2" };
      const libraries = {};
      const result = dependencySource(dependency, libraries);
      expect(result).toBe("https://cdn.jsdelivr.net/npm/react@17.0.2");
    });

    it("should generate correct URL with path - unpkg", () => {
      const dependency = { name: "d3", version: "7.0.0" };
      const libraries = { d3: { path: "/dist/d3.min.js" } };
      const result = dependencySource(dependency, libraries, "unpkg");
      expect(result).toBe("https://unpkg.com/d3@7.0.0/dist/d3.min.js");
    });

    it("should generate correct URL without path - unpkg", () => {
      const dependency = { name: "react", version: "17.0.2" };
      const libraries = {};
      const result = dependencySource(dependency, libraries, "unpkg");
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

  describe("Edge cases", () => {
    it("should handle malformed library configuration", () => {
      const malformedFiles: FileCollection = {
        "package.json": JSON.stringify({
          dependencies: { d3: "7.0.0" },
          vizhub: { libraries: { d3: null } },
        }),
      };
      const result = getConfiguredLibraries(malformedFiles);
      expect(result).toEqual({ d3: null });
    });

    it("should handle empty version strings", () => {
      const dependency = { name: "react", version: "" };
      const result = dependencySource(dependency, {});
      expect(result).toBe("https://cdn.jsdelivr.net/npm/react@");
    });

    it("should handle special characters in dependency names", () => {
      const specialCharDep = { name: "@angular/core", version: "14.0.0" };
      const result = dependencySource(specialCharDep, {});
      expect(result).toBe("https://cdn.jsdelivr.net/npm/@angular/core@14.0.0");
    });

    it("should handle unusual license formats", () => {
      const unusualLicenseFiles: FileCollection = {
        "package.json": JSON.stringify({
          license: { type: "MIT" },
        }),
      };
      const result = getLicense(unusualLicenseFiles);
      expect(result).toBe("MIT");
    });
  });
});
