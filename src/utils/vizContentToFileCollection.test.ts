import { describe, it, expect } from "vitest";
import { vizContentToFileCollection } from "./vizContentToFileCollection";
import type { VizContent } from "@vizhub/viz-types";

describe("vizContentToFileCollection", () => {
  it("should convert VizContent files to FileCollection format", () => {
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

    const result =
      vizContentToFileCollection(mockVizContent);

    expect(result).toEqual({
      "index.html": "<html>Test</html>",
      "script.js": 'console.log("Hello");',
    });
  });

  it("should return an empty object when no files exist", () => {
    const mockVizContent: VizContent = {
      id: "empty-viz",
      files: {},
    };

    const result =
      vizContentToFileCollection(mockVizContent);

    expect(result).toEqual({});
  });

  it("should return an empty object when no files property", () => {
    const mockVizContent: VizContent = {
      id: "empty-viz",

      // @ts-ignore
      files: undefined,
    };

    const result =
      vizContentToFileCollection(mockVizContent);

    expect(result).toEqual({});
  });

  it("should handle files with special characters in names", () => {
    const mockVizContent: VizContent = {
      id: "special-chars-viz",
      files: {
        fileId1: {
          name: "file with spaces.txt",
          text: "content",
        },
        fileId2: { name: "data.csv", text: "a,b,c\n1,2,3" },
      },
    };

    const result =
      vizContentToFileCollection(mockVizContent);

    expect(result).toEqual({
      "file with spaces.txt": "content",
      "data.csv": "a,b,c\n1,2,3",
    });
  });

  it("should preserve file content exactly", () => {
    const longText = `function complex() {
      return {
        nested: {
          data: [1, 2, 3]
        }
      };
    }`;

    const mockVizContent: VizContent = {
      id: "preserve-content-viz",
      files: {
        fileId: { name: "complex.js", text: longText },
      },
    };

    const result =
      vizContentToFileCollection(mockVizContent);

    expect(result["complex.js"]).toBe(longText);
  });
});
