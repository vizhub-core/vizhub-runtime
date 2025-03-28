import { describe, it, expect } from "vitest";
import { getFileText } from "./getFileText";
import type { VizContent } from "@vizhub/viz-types";

describe("getFileText", () => {
  it("should return the text content of a file with matching name", () => {
    const mockVizContent: VizContent = {
      id: "test-viz-123",
      files: {
        file1: {
          name: "index.html",
          text: "<html>Test</html>",
        },
        file2: {
          name: "script.js",
          text: 'console.log("Hello");',
        },
      },
    };

    const result = getFileText(
      mockVizContent,
      "index.html",
    );

    expect(result).toBe("<html>Test</html>");
  });

  it("should return null when no file with the given name exists", () => {
    const mockVizContent: VizContent = {
      id: "test-viz-123",
      files: {
        file1: {
          name: "index.html",
          text: "<html>Test</html>",
        },
        file2: {
          name: "script.js",
          text: 'console.log("Hello");',
        },
      },
    };

    const result = getFileText(mockVizContent, "style.css");

    expect(result).toBeNull();
  });

  it("should return null when content has no files property", () => {
    const mockVizContent = {
      id: "test-viz-123",
    } as VizContent;

    const result = getFileText(
      mockVizContent,
      "index.html",
    );

    expect(result).toBeNull();
  });

  it("should return null when content is undefined", () => {
    const result = getFileText(
      undefined as unknown as VizContent,
      "index.html",
    );

    expect(result).toBeNull();
  });

  it("should find the correct file when multiple files exist", () => {
    const mockVizContent: VizContent = {
      id: "test-viz-123",
      files: {
        file1: { name: "data.csv", text: "a,b,c" },
        file2: {
          name: "index.html",
          text: "<html>First</html>",
        },
        file3: {
          name: "script.js",
          text: 'console.log("Hello");',
        },
        file4: {
          name: "index.html",
          text: "<html>Second</html>",
        },
      },
    };

    // Should return the first matching file's content
    const result = getFileText(
      mockVizContent,
      "index.html",
    );

    expect(result).toBe("<html>First</html>");
  });
});
