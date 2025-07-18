import { describe, it, expect } from "vitest";
import { compile } from "svelte/compiler";
import { transformSvelte, SvelteCompiler } from "./transformSvelte";

describe("transformSvelte", () => {
  it("should use Svelte 5 compiler interface", async () => {
    // Test the basic interface to ensure we're compatible with Svelte 5
    const simpleComponent = `
      <script>
        const name = 'test';
      </script>
      <h1>Hello {name}!</h1>
    `;

    const result = compile(simpleComponent, {
      filename: "Test.svelte",
      generate: "client",
      css: "external",
      dev: false,
    });

    // Verify Svelte 5 compiler returns the expected structure
    expect(result.js).toBeDefined();
    expect(result.js.code).toBeDefined();
    expect(typeof result.js.code).toBe("string");
    
    // CSS should be available if there are styles
    expect(result.css).toBeDefined();
  });

  it("should handle component with CSS", async () => {
    const componentWithCSS = `
      <script>
        const name = 'test';
      </script>
      <h1>Hello {name}!</h1>
      <style>
        h1 { color: red; }
      </style>
    `;

    const result = compile(componentWithCSS, {
      filename: "TestWithCSS.svelte",
      generate: "client",
      css: "external",
      dev: false,
    });

    expect(result.js).toBeDefined();
    expect(result.js.code).toBeDefined();
    expect(result.css).toBeDefined();
    expect(result.css.code).toBeDefined();
    expect(result.css.code).toContain("color: red");
  });

  it("should work with the SvelteCompiler type", async () => {
    const testCompiler: SvelteCompiler = compile;
    
    const result = testCompiler(`
      <script>
        const msg = 'Hello World';
      </script>
      <div>{msg}</div>
    `, {
      filename: "TypeTest.svelte",
      generate: "client",
      css: "external",
    });

    expect(result.js).toBeDefined();
    expect(result.js.code).toContain("msg");
  });
});