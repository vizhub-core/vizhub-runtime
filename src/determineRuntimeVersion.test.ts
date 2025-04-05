import { describe, it, expect } from "vitest";
import { determineRuntimeVersion } from "./determineRuntimeVersion";
import {
  jsScriptTagTypeModule,
  jsScriptTagTypeModules,
  fetchInterception,
  esmBuild,
} from "./test/fixtures/v4";
import { FileCollection } from "@vizhub/viz-types";

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

  it("should return v4 when index.html contains script type=module with importmap", () => {
    const mockFiles: FileCollection = {
      "index.html": `
        <!DOCTYPE html>
        <html>
          <head>
            <script type="importmap">
              { "imports": { "test": "./test.js" } }
            </script>
          </head>
          <body>
            <script type="module" src="index.js"></script>
          </body>
        </html>
      `,
      "index.js":
        'import { hello } from "test"; console.log(hello);',
      "test.js": 'export const hello = "world";',
    };
    const result = determineRuntimeVersion(mockFiles);
    expect(result).toBe("v4");
  });

  it("should return v4 when multiple module scripts are present", () => {
    const mockFiles: FileCollection = {
      "index.html": `
        <!DOCTYPE html>
        <html>
          <body>
            <script type="module" src="index.js"></script>
          </body>
        </html>
      `,
      "index.js":
        'import { hello } from "./utils.js"; console.log(hello);',
      "utils.js": 'export const hello = "world";',
    };
    const result = determineRuntimeVersion(mockFiles);
    expect(result).toBe("v4");
  });

  // Test v4 fixtures
  it("should detect v4 for jsScriptTagTypeModule fixture", () => {
    const result = determineRuntimeVersion(
      jsScriptTagTypeModule,
    );
    expect(result).toBe("v4");
  });

  it("should detect v4 for jsScriptTagTypeModules fixture", () => {
    const result = determineRuntimeVersion(
      jsScriptTagTypeModules,
    );
    expect(result).toBe("v4");
  });

  it("should detect v4 for fetchInterception fixture", () => {
    const result = determineRuntimeVersion(
      fetchInterception,
    );
    expect(result).toBe("v4");
  });

  it("should detect v4 for esmBuild fixture", () => {
    const result = determineRuntimeVersion(esmBuild);
    expect(result).toBe("v4");
  });
});
