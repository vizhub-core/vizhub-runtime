import { describe, it, expect } from "vitest";
import { build } from "../build/index";
import { rollup } from "rollup";

describe("V3 Build Integration - viz export support", () => {
  it("should support export const viz and generate correct HTML", async () => {
    const files = {
      "index.js": `
        export const viz = (container) => {
          container.innerHTML = 'Hello from viz export!';
        }
      `,
    };

    const result = await build({ 
      files, 
      rollup,
      enableSourcemap: false
    });

    // Check that HTML was generated
    expect(result).toBeDefined();
    expect(result.html).toBeDefined();
    expect(typeof result.html).toBe('string');
    
    // Should contain the fallback logic for viz || main
    expect(result.html).toContain("(Viz.viz || Viz.main)");
    
    // Should contain the basic V3 runtime structure
    expect(result.html).toContain('<div id="viz-container');
    expect(result.html).toContain('window.state');
    expect(result.html).toContain('setState');
  });

  it("should still support export const main for backward compatibility", async () => {
    const files = {
      "index.js": `
        export const main = (container) => {
          container.innerHTML = 'Hello from main export!';
        }
      `,
    };

    const result = await build({ 
      files, 
      rollup,
      enableSourcemap: false
    });

    // Check that HTML was generated
    expect(result).toBeDefined();
    expect(result.html).toBeDefined();
    expect(typeof result.html).toBe('string');
    
    // Should still contain the fallback logic
    expect(result.html).toContain("(Viz.viz || Viz.main)");
    
    // Should contain the basic V3 runtime structure
    expect(result.html).toContain('<div id="viz-container');
  });

  it("should prioritize viz over main when both are exported", async () => {
    const files = {
      "index.js": `
        export const main = (container) => {
          container.innerHTML = 'Hello from main!';
        }
        export const viz = (container) => {
          container.innerHTML = 'Hello from viz!';
        }
      `,
    };

    const result = await build({ 
      files, 
      rollup,
      enableSourcemap: false
    });

    // Check that HTML was generated
    expect(result).toBeDefined();
    expect(result.html).toBeDefined();
    expect(typeof result.html).toBe('string');
    
    // Should contain the fallback logic that prioritizes viz
    expect(result.html).toContain("(Viz.viz || Viz.main)");
  });
});