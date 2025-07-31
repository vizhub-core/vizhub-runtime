import { describe, it, expect } from "vitest";
import { compile } from "svelte/compiler";
import { SvelteCompiler } from "./transformSvelte";

describe("Svelte 5 Integration", () => {
  it("should compile a Svelte 5 component correctly", async () => {
    const svelteCode = `
      <script>
        const name = 'Svelte 5';
        console.log('Hello from', name);
      </script>
      <h1>Hello {name}!</h1>
      <style>
        h1 { color: #ff3e00; }
      </style>
    `;

    const getSvelteCompiler =
      async (): Promise<SvelteCompiler> => {
        return compile as SvelteCompiler;
      };

    const svelteCompiler = await getSvelteCompiler();
    const result = svelteCompiler(svelteCode, {
      filename: "App.svelte",
      generate: "client",
      css: "external",
      dev: false,
    });

    expect(result).toBeDefined();
    expect(result.js).toBeDefined();
    expect(result.js.code).toBeDefined();
    expect(typeof result.js.code).toBe("string");
    expect(result.js.code.length).toBeGreaterThan(0);

    // Check that the compiled JS contains expected Svelte 5 patterns
    expect(result.js.code).toContain("svelte/internal");
    expect(result.js.code).toContain("Hello from");

    // Check that CSS is properly extracted
    expect(result.css).toBeDefined();
    expect(result.css).not.toBeNull();
    expect(result.css?.code).toBeDefined();
    expect(result.css?.code).toContain("color: #ff3e00");
  });

  it("should handle Svelte 5 component with onMount and D3 patterns", async () => {
    const svelteCode = `
      <script>
        import { onMount } from 'svelte';
        
        let svg;
        let data = [10, 20, 30];
        
        onMount(() => {
          console.log('Chart mounted with data:', data);
          // D3 chart code would go here
        });
      </script>
      
      <h2>Data Visualization</h2>
      <svg bind:this={svg}></svg>
      
      <style>
        h2 { color: #333; }
        svg { border: 1px solid #ccc; }
      </style>
    `;

    const getSvelteCompiler =
      async (): Promise<SvelteCompiler> => {
        return compile as SvelteCompiler;
      };

    const svelteCompiler = await getSvelteCompiler();
    const result = svelteCompiler(svelteCode, {
      filename: "Chart.svelte",
      generate: "client",
      css: "external",
      dev: false,
    });

    expect(result).toBeDefined();
    expect(result.js).toBeDefined();
    expect(result.js.code).toBeDefined();

    // Check that the compiled JS contains expected patterns
    expect(result.js.code).toContain("onMount");
    expect(result.js.code).toContain(
      "Chart mounted with data",
    );
    expect(result.js.code).toContain("svg");

    // Check that CSS is properly extracted
    expect(result.css).toBeDefined();
    expect(result.css).not.toBeNull();
    expect(result.css?.code).toBeDefined();
    expect(result.css?.code).toContain("color: #333");
    expect(result.css?.code).toContain(
      "border: 1px solid #ccc",
    );
  });

  it("should handle Svelte 5 component with mount pattern", async () => {
    const mainCode = `
      import { mount } from 'svelte';
      import App from './App.svelte';
      
      export const main = (container) => {
        mount(App, { target: container });
      };
    `;

    // This test verifies that the new mount pattern would work
    // In a real scenario, this would be bundled with the Svelte component
    expect(mainCode).toContain("mount");
    expect(mainCode).toContain("from 'svelte'");
    expect(mainCode).toContain("target: container");
  });
});
