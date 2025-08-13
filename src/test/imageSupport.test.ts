import { describe, it, expect } from "vitest";
import { build } from "../build";
import { rollup } from "rollup";
import { createVizCache, createVizContent } from "../v3";

// Test fixtures
const imageInHTML = {
  "index.html": `<!DOCTYPE html>
<html>
  <body>
    <h1>Image Display Test</h1>
    <img src="favicon-tiny.jpg" alt="Tiny favicon" />
    <img src="test-icon.png" alt="Test icon" />
  </body>
</html>`,
  "favicon-tiny.jpg":
    "/9j/4AAQSkZJRgABAQEBLAEsAAD/4RqSRXhpZgAASUkqAAgAAAAIAA4BAgASAAAAbgAAABIBAwABAAAAAQAAABoBBQABAAAAgAAAABsBBQABAAAAiAAAACgBAwABAAAAAgAAADEBAgANAAAAkAAAADIBAgAUAAAAngAAAGmHBAABAAAAsgAAAOoAAABDcmVhdGVkIHdpdGggR0lNUAAsAQAAAQAAACwBAAABAAAAR0lNUCAyLjEwLjMwAAA",
  "test-icon.png":
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
};

const svgInHTML = {
  "index.html": `<!DOCTYPE html>
<html>
  <body>
    <img src="icon.svg" alt="SVG Icon" />
  </body>
</html>`,
  "icon.svg":
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>',
};

const noImagesHTML = {
  "index.html": `<!DOCTYPE html>
<html>
  <body>
    <h1>No images here</h1>
    <img src="external-image.jpg" alt="External image" />
  </body>
</html>`,
};

describe("VizHub Runtime Image Support", () => {
  describe("V1 Runtime", () => {
    it("should convert image src attributes to data URLs", async () => {
      const { html } = await build({ files: imageInHTML });

      // Check that image src attributes are converted to data URLs
      expect(html).toContain(
        'src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4RqSRXhpZgAASUkqAAgAAAAIAA4BAgASAAAAbgAAABIBAwABAAAAAQAAABoBBQABAAAAgAAAABsBBQABAAAAiAAAACgBAwABAAAAAgAAADEBAgANAAAAkAAAADIBAgAUAAAAngAAAGmHBAABAAAAsgAAAOoAAABDcmVhdGVkIHdpdGggR0lNUAAsAQAAAQAAACwBAAABAAAAR0lNUCAyLjEwLjMwAAA"',
      );
      expect(html).toContain(
        'src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="',
      );

      // Check that alt attributes are preserved
      expect(html).toContain('alt="Tiny favicon"');
      expect(html).toContain('alt="Test icon"');

      // Should still be valid HTML
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<h1>Image Display Test</h1>");
    });

    it("should handle SVG images with UTF-8 encoding", async () => {
      const { html } = await build({ files: svgInHTML });

      // Should convert SVG to UTF-8 data URL
      expect(html).toContain(
        'src="data:image/svg+xml;utf8,',
      );
      expect(html).toContain("circle%20cx%3D%2250%22"); // URL-encoded SVG content
      expect(html).toContain('alt="SVG Icon"');
    });

    it("should leave external image references unchanged", async () => {
      const { html } = await build({ files: noImagesHTML });

      // Should not convert external image references
      expect(html).toContain('src="external-image.jpg"');
      expect(html).not.toContain("data:image");

      // Should preserve other HTML content
      expect(html).toContain("<h1>No images here</h1>");
      expect(html).toContain('alt="External image"');
    });

    it("should preserve HTML structure and other attributes", async () => {
      const complexHTML = {
        "index.html": `<!DOCTYPE html>
<html>
  <head>
    <title>Complex Test</title>
    <style>body { font-family: Arial; }</style>
  </head>
  <body>
    <div class="container">
      <img src="logo.png" alt="Logo" class="logo" width="100" height="100" />
      <p>Some content</p>
      <img src="missing.jpg" alt="Missing" />
    </div>
    <script>console.log('test');</script>
  </body>
</html>`,
        "logo.png":
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      };

      const { html } = await build({ files: complexHTML });

      // Should process existing images
      expect(html).toContain(
        'src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="',
      );

      // Should preserve all other attributes
      expect(html).toContain('class="logo"');
      expect(html).toContain('width="100"');
      expect(html).toContain('height="100"');
      expect(html).toContain('alt="Logo"');

      // Should leave missing images unchanged
      expect(html).toContain('src="missing.jpg"');

      // Should preserve HTML structure
      expect(html).toContain("<title>Complex Test</title>");
      expect(html).toContain('class="container"');
      expect(html).toContain("console.log");
      expect(html).toContain(
        "<style>body { font-family: Arial; }</style>",
      );
    });

    it("should handle empty image files gracefully", async () => {
      const emptyImageHTML = {
        "index.html": '<img src="empty.png" alt="Empty" />',
        "empty.png": "",
      };

      const { html } = await build({
        files: emptyImageHTML,
      });

      // Should still convert to data URL even with empty content
      expect(html).toContain(
        'src="data:image/png;base64,"',
      );
      expect(html).toContain('alt="Empty"');
    });
  });

  describe("V2 Runtime", () => {
    it("should handle images in HTML with bundled JavaScript", async () => {
      const v2Files = {
        "index.html": `<!DOCTYPE html>
<html>
  <head>
    <title>V2 Image Test</title>
  </head>
  <body>
    <h1>V2 Runtime Image Test</h1>
    <img src="logo.png" alt="Logo" class="logo" />
    <img src="icon.jpg" alt="Icon" />
    <script src="bundle.js"></script>
  </body>
</html>`,
        "index.js": `
import { message } from "./message.js";
console.log(message);
const container = document.body;
const p = document.createElement('p');
p.textContent = 'V2 bundled JavaScript loaded!';
container.appendChild(p);
        `,
        "message.js": `export const message = "Hello from V2 runtime with images!";`,
        "logo.png":
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        "icon.jpg":
          "/9j/4AAQSkZJRgABAQEBLAEsAAD/4RqSRXhpZgAASUkqAAgAAAAIAA4BAgASAAAAbgAAABIBAwABAAAAAQAAABoBBQABAAAAgAAAABsBBQABAAAAiAAAACgBAwABAAAAAgAAADEBAgANAAAAkAAAADIBAgAUAAAAngAAAGmHBAABAAAAsgAAAOoAAABDcmVhdGVkIHdpdGggR0lNUAAsAQAAAQAAACwBAAABAAAAR0lNUCAyLjEwLjMwAAA",
      };

      const { html } = await build({
        files: v2Files,
        rollup: rollup,
      });

      // Should convert images to data URLs
      expect(html).toContain(
        'src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="',
      );
      expect(html).toContain(
        'src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4RqSRXhpZgAASUkqAAgAAAAIAA4BAgASAAAAbgAAABIBAwABAAAAAQAAABoBBQABAAAAgAAAABsBBQABAAAAiAAAACgBAwABAAAAAgAAADEBAgANAAAAkAAAADIBAgAUAAAAngAAAGmHBAABAAAAsgAAAOoAAABDcmVhdGVkIHdpdGggR0lNUAAsAQAAAQAAACwBAAABAAAAR0lNUCAyLjEwLjMwAAA"',
      );

      // Should preserve other HTML content
      expect(html).toContain(
        "<h1>V2 Runtime Image Test</h1>",
      );
      expect(html).toContain('alt="Logo"');
      expect(html).toContain('alt="Icon"');

      // Should include bundled JavaScript
      expect(html).toContain(
        "Hello from V2 runtime with images!",
      );
    });
  });

  describe("V3 Runtime", () => {
    it("should handle image imports in JavaScript", async () => {
      const v3Files = {
        "index.js": `
import logoSrc from './logo.png';
import iconSrc from './icon.gif';

export const main = (container) => {
  container.innerHTML = \`
    <h1>V3 Runtime Image Import</h1>
    <img src="\${logoSrc}" alt="Logo" />
    <img src="\${iconSrc}" alt="Icon" />
  \`;
};
        `,
        "logo.png":
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        "icon.gif":
          "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      };

      // Set up viz cache for V3
      const vizContent = createVizContent(v3Files);
      const vizId = vizContent.id;
      const vizCache = createVizCache({
        initialContents: [vizContent],
        handleCacheMiss: async () => {
          throw new Error(
            "Cache miss handler not implemented",
          );
        },
      });

      const { html } = await build({
        files: v3Files,
        rollup: rollup,
        vizCache: vizCache,
        vizId: vizId,
      });

      // Should include the main function and JavaScript execution
      expect(html).toContain("const main");

      // The data URLs should be included in the bundled JavaScript
      expect(html).toContain(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      );
      expect(html).toContain(
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      );
    });
  });

  describe("V4 Runtime", () => {
    it("should handle images in HTML with ES modules", async () => {
      const v4Files = {
        "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>V4 Image Test</title>
    <script type="importmap">
      {
        "imports": {
          "react": "https://cdn.jsdelivr.net/npm/react@18/+esm"
        }
      }
    </script>
  </head>
  <body>
    <h1>V4 Runtime Image Test</h1>
    <img src="logo.png" alt="Logo" />
    <img src="icon.svg" alt="Icon" />
    <div id="root"></div>
    <script type="module" src="./index.js"></script>
  </body>
</html>`,
        "index.js": `
console.log('V4 runtime with images!');
const container = document.getElementById('root');
const p = document.createElement('p');
p.textContent = 'ES modules loaded successfully!';
container.appendChild(p);
        `,
        "logo.png":
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        "icon.svg":
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="red"/></svg>',
      };

      const { html } = await build({
        files: v4Files,
        rollup: rollup,
      });

      // Should convert images to data URLs
      expect(html).toContain(
        'src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="',
      );
      expect(html).toContain(
        'src="data:image/svg+xml;utf8,',
      );
      expect(html).toContain("rect%20width%3D%22100%22"); // URL-encoded SVG content

      // Should preserve V4 runtime structure
      expect(html).toContain('type="importmap"');
      expect(html).toContain('type="module"');
      expect(html).toContain(
        "<h1>V4 Runtime Image Test</h1>",
      );

      // Should preserve other attributes
      expect(html).toContain('alt="Logo"');
      expect(html).toContain('alt="Icon"');

      // Should include the bundled JavaScript
      expect(html).toContain("V4 runtime with images!");
    });
  });
});
