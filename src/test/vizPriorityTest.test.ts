import { describe, it, expect } from "vitest";
import { build } from "../build/index";
import { rollup } from "rollup";

describe("V3 Runtime viz vs main priority test", () => {
  it("should use viz function when both viz and main are exported", async () => {
    const files = {
      "index.js": `
        export const main = (container) => {
          container.innerHTML = '<div class="main-used">Main was called</div>';
        }
        export const viz = (container) => {
          container.innerHTML = '<div class="viz-used">Viz was called</div>';
        }
      `,
    };

    const result = await build({
      files,
      rollup,
      enableSourcemap: false,
    });

    const html = result.html;

    // Verify the HTML contains the priority logic
    expect(html).toContain("(Viz.viz || Viz.main)");

    // The bundled code should contain both exports
    expect(html).toContain("exports.main=main");
    expect(html).toContain("exports.viz=viz");

    // The runtime should prioritize viz over main due to the || operator
    expect(html).toContain("Viz.viz || Viz.main");
    expect(html).not.toContain("Viz.main || Viz.viz");
  });

  it("should fall back to main when only main is exported", async () => {
    const files = {
      "index.js": `
        export const main = (container) => {
          container.innerHTML = '<div class="main-used">Main was called</div>';
        }
      `,
    };

    const result = await build({
      files,
      rollup,
      enableSourcemap: false,
    });

    const html = result.html;

    // Verify the HTML contains the priority logic even with only main
    expect(html).toContain("(Viz.viz || Viz.main)");
    expect(html).toContain("exports.main=main");
  });

  it("should work with only viz exported", async () => {
    const files = {
      "index.js": `
        export const viz = (container) => {
          container.innerHTML = '<div class="viz-used">Viz was called</div>';
        }
      `,
    };

    const result = await build({
      files,
      rollup,
      enableSourcemap: false,
    });

    const html = result.html;

    // Verify the HTML contains the priority logic
    expect(html).toContain("(Viz.viz || Viz.main)");
    expect(html).toContain("exports.viz=viz");
  });
});
