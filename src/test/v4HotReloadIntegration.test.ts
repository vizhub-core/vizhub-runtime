import { describe, it, expect } from "vitest";
import { build } from "../build";
import { rollup } from "rollup";

describe("V4 Hot Reloading Integration", () => {
  it("should support complete hot reloading cycle", async () => {
    // Initial V4 files
    const initialFiles = {
      "index.html": `<!DOCTYPE html>
<html>
  <head><title>V4 Hot Reload Test</title></head>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>`,
      "main.js": `
        import { render } from './renderer.js';
        render(document.getElementById('app'), 'Initial Version');
      `,
      "renderer.js": `
        export function render(container, message) {
          container.innerHTML = '<h1>' + message + '</h1>';
          console.log('Rendered: ' + message);
        }
      `
    };

    // First build - should detect as V4 and include hot reload support
    const initialBuild = await build({ 
      files: initialFiles, 
      rollup,
      enableSourcemap: false
    });

    expect(initialBuild.runtimeVersion).toBe("v4");
    expect(initialBuild.html).toContain("// V4 Hot Reloading Support");
    expect(initialBuild.js).toBeTruthy();
    expect(initialBuild.js).toContain("Initial Version");

    // Modified files for hot reload
    const updatedFiles = {
      ...initialFiles,
      "renderer.js": `
        export function render(container, message) {
          container.innerHTML = '<h1 style="color: blue;">' + message + '</h1>';
          console.log('Rendered with style: ' + message);
        }
      `
    };

    // Second build - simulating hot reload
    const updatedBuild = await build({ 
      files: updatedFiles, 
      rollup,
      enableSourcemap: false
    });

    expect(updatedBuild.runtimeVersion).toBe("v4");
    expect(updatedBuild.js).toContain("color: blue");
    expect(updatedBuild.js).toContain("Rendered with style");
    
    // The HTML should still contain the hot reload script
    expect(updatedBuild.html).toContain("// V4 Hot Reloading Support");
  });

  it("should handle inline scripts with hot reloading", async () => {
    const files = {
      "index.html": `<!DOCTYPE html>
<html>
  <body>
    <div id="output"></div>
    <script type="module">
      const output = document.getElementById('output');
      output.textContent = 'Inline script executed';
      console.log('Inline script running');
    </script>
  </body>
</html>`
    };

    const result = await build({ 
      files, 
      rollup,
      enableSourcemap: false
    });

    expect(result.runtimeVersion).toBe("v4");
    expect(result.html).toContain("// V4 Hot Reloading Support");
    expect(result.js).toContain("Inline script executed");
    expect(result.js).toContain("Inline script running");
  });

  it("should handle mixed external and inline modules", async () => {
    const files = {
      "index.html": `<!DOCTYPE html>
<html>
  <body>
    <script type="module" src="./external.js"></script>
    <script type="module">
      import { helper } from './helper.js';
      helper('from inline');
    </script>
  </body>
</html>`,
      "external.js": `
        console.log('External module loaded');
      `,
      "helper.js": `
        export function helper(source) {
          console.log('Helper called ' + source);
        }
      `
    };

    const result = await build({ 
      files, 
      rollup,
      enableSourcemap: false
    });

    expect(result.runtimeVersion).toBe("v4");
    expect(result.html).toContain("// V4 Hot Reloading Support");
    expect(result.js).toContain("External module loaded");
    expect(result.js).toContain("Helper called");
    expect(result.js).toContain("from inline");
  });
});