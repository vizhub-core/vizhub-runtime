import { describe, it, expect } from "vitest";
import { v4Build } from "../v4/index";
import { jsInlineScriptModule } from "./fixtures/v4/jsInlineScriptModule";
import { rollup } from "rollup";

describe("v4Build integration test", () => {
  it("should fully process the inline script test fixture", async () => {
    const result = await v4Build({
      files: jsInlineScriptModule,
      rollup,
      enableSourcemap: false,
    });

    // Check that the HTML has been processed
    const html = result["index.html"];
    expect(html).toBeDefined();

    // Should not contain the original import statement
    expect(html).not.toContain(
      'import { main } from "./index.js";',
    );

    // Should contain bundled code with the function definition
    expect(html).toContain('<script type="module">');
    expect(html).toContain("function main(container)");
    expect(html).toContain("Hello from inline script!");

    // Should still contain the main function call (it was part of the original inline script)
    expect(html).toContain(
      'main(document.getElementById("viz-container"));',
    );

    // Should preserve the HTML structure
    expect(html).toContain(
      '<div id="viz-container"></div>',
    );
    expect(html).toContain("<title>D3 Example</title>");
    expect(html).toContain('<script type="importmap">');
  });
});
