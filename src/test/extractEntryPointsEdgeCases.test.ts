import { describe, it, expect } from "vitest";
import { extractModuleEntryPoints } from "../v4/extractEntryPoints";

describe("extractModuleEntryPoints edge cases", () => {
  it("should handle whitespace in inline scripts", () => {
    const html = `
      <script type="module">
        
        console.log("Hello!");
        
      </script>
    `;
    const result = extractModuleEntryPoints(html);
    expect(result.entryPoints).toEqual(["__inline_script_0.js"]);
    expect(result.inlineScripts[0].content).toBe('console.log("Hello!");');
  });

  it("should handle empty inline scripts", () => {
    const html = `
      <script type="module">
        
      </script>
    `;
    const result = extractModuleEntryPoints(html);
    expect(result.entryPoints).toEqual([]);
    expect(result.inlineScripts).toEqual([]);
  });

  it("should handle script tags without type=module", () => {
    const html = `
      <script>
        console.log("Not a module");
      </script>
      <script type="text/javascript">
        console.log("Also not a module");
      </script>
    `;
    const result = extractModuleEntryPoints(html);
    expect(result.entryPoints).toEqual([]);
    expect(result.inlineScripts).toEqual([]);
  });

  it("should handle multiple inline scripts", () => {
    const html = `
      <script type="module">
        console.log("First script");
      </script>
      <script type="module">
        console.log("Second script");
      </script>
    `;
    const result = extractModuleEntryPoints(html);
    expect(result.entryPoints).toEqual(["__inline_script_0.js", "__inline_script_1.js"]);
    expect(result.inlineScripts).toEqual([
      { id: "__inline_script_0.js", content: 'console.log("First script");' },
      { id: "__inline_script_1.js", content: 'console.log("Second script");' }
    ]);
  });

  it("should handle complex HTML structures", () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="importmap">
            { "imports": { "d3": "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm" } }
          </script>
        </head>
        <body>
          <div id="viz-container"></div>
          <script type="module">
            import { main } from "./index.js";
            main(document.getElementById("viz-container"));
          </script>
        </body>
      </html>
    `;
    const result = extractModuleEntryPoints(html);
    expect(result.entryPoints).toEqual(["__inline_script_0.js"]);
    expect(result.inlineScripts[0].content.trim()).toBe('import { main } from "./index.js";\n            main(document.getElementById("viz-container"));');
  });

  it("should handle mixed quoted attributes", () => {
    const html = `
      <script type='module'>
        console.log("Single quotes for type");
      </script>
      <script type="module">
        console.log("Double quotes for type");
      </script>
    `;
    const result = extractModuleEntryPoints(html);
    expect(result.entryPoints).toEqual(["__inline_script_0.js", "__inline_script_1.js"]);
    expect(result.inlineScripts).toEqual([
      { id: "__inline_script_0.js", content: 'console.log("Single quotes for type");' },
      { id: "__inline_script_1.js", content: 'console.log("Double quotes for type");' }
    ]);
  });
});