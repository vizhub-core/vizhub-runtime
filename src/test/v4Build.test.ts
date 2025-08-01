import { describe, it, expect } from "vitest";
import { v4Build } from "../v4/index";

// Mock rollup function for testing
const mockRollup = async (options: any) => {
  return {
    generate: async () => ({
      output: [
        {
          code: `console.log("bundled code for ${options.input}");`,
        },
      ],
    }),
  };
};

describe("v4Build", () => {
  it("should handle inline script modules", async () => {
    const files = {
      "index.html": `
        <script type="module">
          import { main } from "./index.js";
          main();
        </script>
      `,
      "index.js": `export function main() { console.log("Hello from main"); }`,
    };

    const result = await v4Build({
      files,
      rollup: mockRollup as any,
      enableSourcemap: false,
    });

    expect(result["index.html"]).toContain(
      '<script type="module">',
    );
    expect(result["index.html"]).toContain(
      "bundled code for",
    );
    expect(result["index.html"]).not.toContain(
      'import { main } from "./index.js";',
    );
  });

  it("should handle mixed src and inline scripts", async () => {
    const files = {
      "index.html": `
        <script type="module" src="main.js"></script>
        <script type="module">
          import { helper } from "./helper.js";
          helper();
        </script>
      `,
      "main.js": `console.log("main script");`,
      "helper.js": `export function helper() { console.log("helper"); }`,
    };

    const result = await v4Build({
      files,
      rollup: mockRollup as any,
      enableSourcemap: false,
    });

    expect(result["index.html"]).toContain(
      "bundled code for ./main.js",
    );
    expect(result["index.html"]).toContain(
      "bundled code for ./__inline_script_0.js",
    );
  });
});
