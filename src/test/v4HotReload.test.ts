import { describe, it, expect } from "vitest";
import { v4BuildWithHotReload } from "../v4/index";
import { rollup } from "rollup";

describe("V4 Hot Reloading", () => {
  it("should include hot reload script in HTML", async () => {
    const files = {
      "index.html": `
        <!DOCTYPE html>
        <html>
          <head><title>Test</title></head>
          <body>
            <div id="container"></div>
            <script type="module" src="./main.js"></script>
          </body>
        </html>
      `,
      "main.js": `
        console.log("Hello from main");
      `,
    };

    const result = await v4BuildWithHotReload({
      files,
      rollup,
      enableSourcemap: false,
    });

    const html = result.files["index.html"];

    // Should include the hot reload script
    expect(html).toContain("// V4 Hot Reloading Support");
    expect(html).toContain("addEventListener('message'");
    expect(html).toContain("case 'runJS':");
    expect(html).toContain("case 'runCSS':");

    // Should have bundled JS
    expect(result.bundledJS).toContain("Hello from main");
  });

  it("should return separate bundled JS for hot reloading", async () => {
    const files = {
      "index.html": `
        <script type="module">
          import { helper } from "./helper.js";
          helper();
        </script>
      `,
      "helper.js": `
        export function helper() {
          console.log("Helper function");
        }
      `,
    };

    const result = await v4BuildWithHotReload({
      files,
      rollup,
      enableSourcemap: false,
    });

    // Should return bundled JS that includes the helper function
    expect(result.bundledJS).toBeTruthy();
    expect(result.bundledJS).toContain("Helper function");

    // HTML should be processed correctly
    const html = result.files["index.html"];
    expect(html).toContain('<script type="module">');
    expect(html).toContain("// V4 Hot Reloading Support");
  });
});
