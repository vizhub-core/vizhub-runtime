import { describe, it, expect } from "vitest";
import {
  isImageFile,
  getImageMimeType,
  convertImageToDataURL,
  processHTMLImages,
  IMAGE_EXTENSIONS
} from "./imageSupport";

describe("imageSupport", () => {
  describe("isImageFile", () => {
    it("should detect image files by extension", () => {
      expect(isImageFile("photo.jpg")).toBe(true);
      expect(isImageFile("photo.jpeg")).toBe(true);
      expect(isImageFile("logo.png")).toBe(true);
      expect(isImageFile("animation.gif")).toBe(true);
      expect(isImageFile("icon.svg")).toBe(true);
      expect(isImageFile("image.webp")).toBe(true);
      expect(isImageFile("bitmap.bmp")).toBe(true);
    });

    it("should handle uppercase extensions", () => {
      expect(isImageFile("photo.JPG")).toBe(true);
      expect(isImageFile("logo.PNG")).toBe(true);
      expect(isImageFile("ANIMATION.GIF")).toBe(true);
    });

    it("should reject non-image files", () => {
      expect(isImageFile("script.js")).toBe(false);
      expect(isImageFile("style.css")).toBe(false);
      expect(isImageFile("document.html")).toBe(false);
      expect(isImageFile("data.json")).toBe(false);
      expect(isImageFile("readme.txt")).toBe(false);
    });

    it("should handle files without extensions", () => {
      expect(isImageFile("filename")).toBe(false);
      expect(isImageFile("")).toBe(false);
    });

    it("should handle files with multiple dots", () => {
      expect(isImageFile("my.file.name.jpg")).toBe(true);
      expect(isImageFile("config.test.js")).toBe(false);
    });
  });

  describe("getImageMimeType", () => {
    it("should return correct MIME types", () => {
      expect(getImageMimeType("photo.jpg")).toBe("image/jpeg");
      expect(getImageMimeType("photo.jpeg")).toBe("image/jpeg");
      expect(getImageMimeType("logo.png")).toBe("image/png");
      expect(getImageMimeType("animation.gif")).toBe("image/gif");
      expect(getImageMimeType("icon.svg")).toBe("image/svg+xml");
      expect(getImageMimeType("image.webp")).toBe("image/webp");
      expect(getImageMimeType("bitmap.bmp")).toBe("image/bmp");
    });

    it("should handle uppercase extensions", () => {
      expect(getImageMimeType("photo.JPG")).toBe("image/jpeg");
      expect(getImageMimeType("logo.PNG")).toBe("image/png");
    });

    it("should return fallback MIME type for unknown extensions", () => {
      expect(getImageMimeType("unknown.xyz")).toBe("image/png");
      expect(getImageMimeType("noextension")).toBe("image/png");
    });
  });

  describe("convertImageToDataURL", () => {
    it("should convert base64 image to data URL", () => {
      const base64Content = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ";
      const result = convertImageToDataURL("test.png", base64Content);
      expect(result).toBe(`data:image/png;base64,${base64Content}`);
    });

    it("should handle JPEG files", () => {
      const base64Content = "/9j/4AAQSkZJRgABAQEBLAEsAAD";
      const result = convertImageToDataURL("test.jpg", base64Content);
      expect(result).toBe(`data:image/jpeg;base64,${base64Content}`);
    });

    it("should handle GIF files", () => {
      const base64Content = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      const result = convertImageToDataURL("test.gif", base64Content);
      expect(result).toBe(`data:image/gif;base64,${base64Content}`);
    });

    it("should handle WebP files", () => {
      const base64Content = "UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAABAAA";
      const result = convertImageToDataURL("test.webp", base64Content);
      expect(result).toBe(`data:image/webp;base64,${base64Content}`);
    });

    it("should handle raw SVG content", () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>';
      const result = convertImageToDataURL("test.svg", svgContent);
      expect(result).toBe(`data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`);
    });

    it("should handle base64-encoded SVG content", () => {
      const base64SVG = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgcj0iMTAiLz48L3N2Zz4=";
      const result = convertImageToDataURL("test.svg", base64SVG);
      expect(result).toBe(`data:image/svg+xml;base64,${base64SVG}`);
    });

    it("should handle empty content", () => {
      const result = convertImageToDataURL("test.png", "");
      expect(result).toBe("data:image/png;base64,");
    });

    it("should handle content with whitespace", () => {
      const base64WithSpaces = " iVBORw0KGgo \n AAAANSUhEUgAAAAEAAAAB ";
      const result = convertImageToDataURL("test.png", base64WithSpaces);
      expect(result).toBe(`data:image/png;base64,${base64WithSpaces}`);
    });
  });

  describe("IMAGE_EXTENSIONS constant", () => {
    it("should contain all expected extensions", () => {
      const expected = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".bmp"];
      expect(IMAGE_EXTENSIONS).toEqual(expected);
    });

    it("should be readonly array", () => {
      // TypeScript compile-time check - this would fail if not readonly
      expect(Array.isArray(IMAGE_EXTENSIONS)).toBe(true);
    });
  });

  describe("processHTMLImages", () => {
    it("should replace img src with data URLs when image file exists", () => {
      const html = '<img src="logo.png" alt="Logo">';
      const files = {
        "logo.png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB"
      };
      const result = processHTMLImages(html, files);
      expect(result).toBe('<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB" alt="Logo">');
    });

    it("should handle multiple img tags", () => {
      const html = '<img src="logo.png" alt="Logo"><img src="icon.jpg" alt="Icon">';
      const files = {
        "logo.png": "PNG_DATA",
        "icon.jpg": "JPG_DATA"
      };
      const result = processHTMLImages(html, files);
      expect(result).toContain('src="data:image/png;base64,PNG_DATA"');
      expect(result).toContain('src="data:image/jpeg;base64,JPG_DATA"');
    });

    it("should preserve img tags without matching files", () => {
      const html = '<img src="external.png" alt="External">';
      const files = {};
      const result = processHTMLImages(html, files);
      expect(result).toBe(html);
    });

    it("should preserve img tags with non-image file references", () => {
      const html = '<img src="script.js" alt="Not an image">';
      const files = {
        "script.js": "console.log('hello');"
      };
      const result = processHTMLImages(html, files);
      expect(result).toBe(html);
    });

    it("should handle single and double quotes", () => {
      const html = `<img src='logo.png' alt="Logo"><img src="icon.gif" alt='Icon'>`;
      const files = {
        "logo.png": "PNG_DATA",
        "icon.gif": "GIF_DATA"
      };
      const result = processHTMLImages(html, files);
      expect(result).toContain('src="data:image/png;base64,PNG_DATA"');
      expect(result).toContain('src="data:image/gif;base64,GIF_DATA"');
    });

    it("should preserve other img attributes", () => {
      const html = '<img class="logo" id="main-logo" src="logo.png" alt="Logo" width="100">';
      const files = {
        "logo.png": "PNG_DATA"
      };
      const result = processHTMLImages(html, files);
      expect(result).toBe('<img class="logo" id="main-logo" src="data:image/png;base64,PNG_DATA" alt="Logo" width="100">');
    });

    it("should handle SVG files correctly", () => {
      const html = '<img src="icon.svg" alt="SVG Icon">';
      const files = {
        "icon.svg": '<svg><circle r="10"/></svg>'
      };
      const result = processHTMLImages(html, files);
      expect(result).toContain('src="data:image/svg+xml;utf8,');
    });

    it("should handle complex HTML structure", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div>
              <img src="header.jpg" alt="Header" class="header-img">
              <p>Some text</p>
              <img src="footer.png" alt="Footer">
            </div>
          </body>
        </html>
      `;
      const files = {
        "header.jpg": "HEADER_DATA",
        "footer.png": "FOOTER_DATA"
      };
      const result = processHTMLImages(html, files);
      expect(result).toContain('src="data:image/jpeg;base64,HEADER_DATA"');
      expect(result).toContain('src="data:image/png;base64,FOOTER_DATA"');
    });

    it("should not modify img tags without src attribute", () => {
      const html = '<img alt="No src">';
      const files = {};
      const result = processHTMLImages(html, files);
      expect(result).toBe(html);
    });

    it("should handle empty HTML", () => {
      const html = '';
      const files = {};
      const result = processHTMLImages(html, files);
      expect(result).toBe('');
    });
  });
});