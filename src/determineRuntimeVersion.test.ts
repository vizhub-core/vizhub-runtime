import { describe, it, expect } from "vitest";
import { determineRuntimeVersion } from "./determineRuntimeVersion";
import { FileCollection } from "./types";

describe("determineRuntimeVersion", () => {
  it("should return null when there are no files", () => {
    const mockFiles: FileCollection = {};
    const result = determineRuntimeVersion(mockFiles);
    expect(result).toBe(null);
  });

  it("should return v1 when only index.html exists", () => {
    const mockFiles: FileCollection = {
      "index.html": "<html></html>",
    };
    const result = determineRuntimeVersion(mockFiles);
    expect(result).toBe("v1");
  });

  it("should return v2 when both index.html and index.js exist", () => {
    const mockFiles: FileCollection = {
      "index.html": "<html></html>",
      "index.js": 'console.log("Hello");',
    };
    const result = determineRuntimeVersion(mockFiles);
    expect(result).toBe("v2");
  });

  it("should return v2 when both index.html and index.jsx exist", () => {
    const mockFiles: FileCollection = {
      "index.html": "<html></html>",
      "index.jsx": 'console.log("Hello");',
    };
    const result = determineRuntimeVersion(mockFiles);
    expect(result).toBe("v2");
  });

  it("should return v3 when only index.js exists", () => {
    const mockFiles: FileCollection = {
      "index.js": 'console.log("Hello");',
    };
    const result = determineRuntimeVersion(mockFiles);
    expect(result).toBe("v3");
  });

  it("should return null when only index.jsx exists (no v3 support for JSX)", () => {
    const mockFiles: FileCollection = {
      "index.jsx": 'console.log("Hello");',
    };
    const result = determineRuntimeVersion(mockFiles);
    expect(result).toBe(null);
  });
});
