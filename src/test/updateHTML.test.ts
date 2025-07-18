import { describe, it, expect } from "vitest";
import { updateHTML } from "../v4/updateHTML";

describe("updateHTML", () => {
  it("should replace inline script modules with bundled code", () => {
    const files = {
      "index.html": `
        <script type="module">
          import { main } from "./index.js";
          main();
        </script>
      `,
      "index.js": `export function main() { console.log("Hello from main"); }`
    };

    const bundled = new Map([
      ["__inline_script_0.js", "console.log('bundled inline script');"]
    ]);

    const inlineScripts = [{
      id: "__inline_script_0.js",
      content: 'import { main } from "./index.js";\n          main();'
    }];

    const result = updateHTML(files, bundled, inlineScripts);

    expect(result).toContain("console.log('bundled inline script');");
    expect(result).not.toContain('import { main } from "./index.js";');
  });

  it("should handle mixed src and inline scripts", () => {
    const files = {
      "index.html": `
        <script type="module" src="main.js"></script>
        <script type="module">
          import { helper } from "./helper.js";
          helper();
        </script>
      `,
      "main.js": `console.log("main script");`,
      "helper.js": `export function helper() { console.log("helper"); }`
    };

    const bundled = new Map([
      ["main.js", "console.log('bundled main script');"],
      ["__inline_script_0.js", "console.log('bundled inline script');"]
    ]);

    const inlineScripts = [{
      id: "__inline_script_0.js",
      content: 'import { helper } from "./helper.js";\n          helper();'
    }];

    const result = updateHTML(files, bundled, inlineScripts);

    expect(result).toContain("console.log('bundled main script');");
    expect(result).toContain("console.log('bundled inline script');");
    expect(result).not.toContain('src="main.js"');
    expect(result).not.toContain('import { helper } from "./helper.js";');
  });
});