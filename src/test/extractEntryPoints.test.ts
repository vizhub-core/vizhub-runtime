import { describe, it, expect } from "vitest";
import { extractModuleEntryPoints } from "../v4/extractEntryPoints";

describe("extractModuleEntryPoints", () => {
  it("should extract entry points from script src attributes", () => {
    const html = `<script type="module" src="index.js"></script>`;
    const result = extractModuleEntryPoints(html);
    expect(result.entryPoints).toEqual(["index.js"]);
    expect(result.inlineScripts).toEqual([]);
  });

  it("should extract multiple entry points", () => {
    const html = `
      <script type="module" src="index.js"></script>
      <script type="module" src="other.js"></script>
    `;
    const result = extractModuleEntryPoints(html);
    expect(result.entryPoints).toEqual([
      "index.js",
      "other.js",
    ]);
    expect(result.inlineScripts).toEqual([]);
  });

  it("should handle inline script modules", () => {
    const html = `
      <script type="module">
        import { main } from "./index.js";
        main();
      </script>
    `;
    const result = extractModuleEntryPoints(html);
    expect(result.entryPoints).toEqual([
      "__inline_script_0.js",
    ]);
    expect(result.inlineScripts).toEqual([
      {
        id: "__inline_script_0.js",
        content:
          'import { main } from "./index.js";\n        main();',
      },
    ]);
  });

  it("should handle mixed src and inline scripts", () => {
    const html = `
      <script type="module" src="index.js"></script>
      <script type="module">
        import { main } from "./other.js";
        main();
      </script>
    `;
    const result = extractModuleEntryPoints(html);
    expect(result.entryPoints).toEqual([
      "index.js",
      "__inline_script_0.js",
    ]);
    expect(result.inlineScripts).toEqual([
      {
        id: "__inline_script_0.js",
        content:
          'import { main } from "./other.js";\n        main();',
      },
    ]);
  });
});
