# Image Support Implementation Plan

## Overview

This document outlines the technical approach for adding image support to VizHub Runtime. The goal is to enable users to include image files in their visualizations across all runtime versions (v1-v4).

## Problem Statement

Currently, VizHub Runtime does not support image files. Users cannot include images like `.jpg`, `.png`, `.gif`, `.svg`, `.webp`, or `.bmp` in their visualizations. The example should work:

**Files:**

- `index.html` - HTML file with `<img src="favicon-tiny.jpg">`
- `favicon-tiny.jpg` - Base64-encoded image content
- `index.js` - JavaScript entry point

**Expected behavior:** The image should display correctly in the rendered visualization.

## Current Architecture Analysis

### File Processing Pipeline

1. **File Collection**: Files are represented as `FileCollection` objects where keys are filenames and values are file contents (strings)
2. **Runtime Detection**: `determineRuntimeVersion()` chooses v1-v4 based on file presence and content
3. **Build Process**: Each runtime version processes files differently:
   - **v1**: Passes files directly to `magic-sandbox`
   - **v2**: Bundles JS with Rollup, then passes to `magic-sandbox`
   - **v3**: Advanced bundling with cross-viz imports
   - **v4**: ES modules with import maps and hot reloading

### Magic Sandbox Integration

- All runtime versions ultimately use `magic-sandbox` for final HTML generation
- `magic-sandbox` handles fetch proxy, script injection, and sandboxing
- Files are passed as `FileCollection` objects to `magic-sandbox`

## Technical Implementation Approach

### Phase 1: Image File Detection and Processing

#### 1.1 Image File Type Detection

Create utility functions to identify image files:

```typescript
// src/common/imageSupport.ts
export const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".svg",
  ".webp",
  ".bmp",
] as const;

export const isImageFile = (filename: string): boolean => {
  const extension = filename.toLowerCase().split(".").pop();
  return IMAGE_EXTENSIONS.includes(`.${extension}` as any);
};

export const getImageMimeType = (
  filename: string,
): string => {
  const extension = filename.toLowerCase().split(".").pop();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "webp":
      return "image/webp";
    case "bmp":
      return "image/bmp";
    default:
      return "image/png"; // fallback
  }
};
```

#### 1.2 Data URL Conversion

Convert base64 image content to data URLs:

```typescript
export const convertImageToDataURL = (
  filename: string,
  content: string,
): string => {
  const mimeType = getImageMimeType(filename);
  const extension = filename.toLowerCase().split(".").pop();

  // Handle SVG files that might not be base64 encoded
  if (extension === "svg" && !isBase64Encoded(content)) {
    return `data:${mimeType};utf8,${encodeURIComponent(content)}`;
  }

  return `data:${mimeType};base64,${content}`;
};

const isBase64Encoded = (content: string): boolean => {
  // Simple check for base64 content
  return /^[A-Za-z0-9+/]*={0,2}$/.test(
    content.replace(/\s/g, ""),
  );
};
```

### Phase 2: Integration with Runtime Versions

#### 2.1 V1 Runtime (HTML-only)

For v1 runtime, image support needs to be handled before passing to `magic-sandbox`:

**Implementation Location:** `src/build/build.ts`

```typescript
const processImagesForV1 = (
  files: FileCollection,
): FileCollection => {
  const processedFiles = { ...files };

  for (const [filename, content] of Object.entries(files)) {
    if (isImageFile(filename)) {
      // Convert image files to data URLs and store them
      // We'll modify magic-sandbox integration to handle this
      continue;
    }
  }

  return processedFiles;
};
```

#### 2.2 V2 Runtime (Bundled JS + HTML)

V2 runtime processes files through Rollup bundling then `magic-sandbox`. Images should be handled similarly to v1.

**Implementation Location:** `src/v2/` and integration in `src/build/build.ts`

#### 2.3 V3 Runtime (Advanced bundling)

V3 has the most complex file processing with cross-viz imports and virtual file system.

**Implementation Location:**

- `src/common/virtualFileSystem.ts` - Add image file resolution
- `src/v3/` - Image processing in bundling pipeline

```typescript
// Update virtualFileSystem to handle image files
export const virtualFileSystem = (
  files: FileCollection,
): Plugin => {
  return {
    name: "virtual-file-system",
    resolveId(source: string, importer?: string) {
      // ... existing logic ...

      // Handle image file imports
      if (isImageFile(source)) {
        const resolvedPath = cleanImporter
          ? normalizePath(joinPaths(cleanImporter, source))
          : normalizePath(source);

        if (files[resolvedPath]) {
          return VIRTUAL_PREFIX + resolvedPath;
        }
      }

      // ... rest of existing logic ...
    },

    load(id: string) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        const actualId = id.slice(VIRTUAL_PREFIX.length);
        if (files[actualId] && isImageFile(actualId)) {
          // Return image as data URL for JS imports
          const dataURL = convertImageToDataURL(
            actualId,
            files[actualId],
          );
          return `export default "${dataURL}";`;
        }
        if (files[actualId]) {
          return files[actualId];
        }
      }
      return null;
    },
  };
};
```

#### 2.4 V4 Runtime (ES Modules)

V4 runtime uses native ES modules and needs image support in the import resolution.

**Implementation Location:** `src/v4/`

### Phase 3: Magic Sandbox Integration

The key challenge is ensuring `magic-sandbox` can properly serve image files when referenced in HTML. We need to investigate two approaches:

#### Approach A: Pre-process HTML

Before passing to `magic-sandbox`, scan HTML content and replace image src attributes with data URLs:

```typescript
const processHTMLImages = (
  html: string,
  files: FileCollection,
): string => {
  return html.replace(
    /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
    (match, src) => {
      if (files[src] && isImageFile(src)) {
        const dataURL = convertImageToDataURL(
          src,
          files[src],
        );
        return match.replace(src, dataURL);
      }
      return match;
    },
  );
};
```

#### Approach B: Extend Magic Sandbox (if possible)

If `magic-sandbox` supports custom file serving, extend it to handle image files directly.

### Phase 4: Testing Strategy

#### 4.1 Unit Tests

Create comprehensive tests for image utilities:

- `src/common/imageSupport.test.ts`
- Test MIME type detection
- Test data URL conversion
- Test base64 vs raw SVG handling

#### 4.2 Integration Tests

Add image support tests for each runtime version:

**V1 Tests (`src/test/v1.test.ts`):**

```typescript
const imageInHTML = {
  "index.html": `<!DOCTYPE html>
<html>
  <body>
    <img src="favicon-tiny.jpg" alt="Test Image" />
  </body>
</html>`,
  "favicon-tiny.jpg":
    "/9j/4AAQSkZJRgABAQEBLAEsAAD/4RqSRXhpZgAA...", // base64 content
};
```

**V2-V4 Tests:** Similar patterns adapted for each runtime's file structure.

#### 4.3 End-to-End Tests

Test actual image rendering in browser using Puppeteer:

- Verify image loads correctly
- Test different image formats
- Verify data URL generation

### Phase 5: Documentation Updates

#### 5.1 README.md Updates

Add image support documentation to README:

- Supported image formats
- Usage examples for each runtime version
- Base64 encoding requirements

#### 5.2 JSDoc Comments

Add comprehensive documentation to new functions and utilities.

## Implementation Timeline

1. **Phase 1** (Image utilities): Create core image detection and processing functions
2. **Phase 2** (Runtime integration): Add image support to each runtime version
3. **Phase 3** (Magic Sandbox): Integrate image processing with magic-sandbox
4. **Phase 4** (Testing): Comprehensive test coverage
5. **Phase 5** (Documentation): Update docs and examples

## Risk Mitigation

### Potential Issues:

1. **Large image files**: Base64 encoding increases file size by ~33%
2. **Memory usage**: Loading many images could impact performance
3. **Magic-sandbox compatibility**: May need to investigate magic-sandbox internals

### Mitigation Strategies:

1. **Size limits**: Consider adding warnings for large images
2. **Lazy loading**: Implement on-demand image processing
3. **Fallback approach**: Use HTML preprocessing if magic-sandbox integration fails

## Success Criteria

1. **Functional**: All image formats load correctly in all runtime versions
2. **Performance**: Minimal impact on build times and memory usage
3. **Developer Experience**: Simple, intuitive API for including images
4. **Test Coverage**: Comprehensive test suite covering all scenarios
5. **Documentation**: Clear examples and usage guidelines

## Example Usage After Implementation

**V1 Runtime:**

```typescript
const files = {
  "index.html": `<!DOCTYPE html>
<html>
  <body>
    <img src="logo.png" alt="Logo" />
  </body>
</html>`,
  "logo.png":
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
};
```

**V3 Runtime (with import):**

```typescript
// index.js
import logoSrc from "./logo.png";
export const main = (container) => {
  container.innerHTML = `<img src="${logoSrc}" alt="Logo" />`;
};
```

This approach ensures consistent image support across all runtime versions while maintaining the existing architecture and performance characteristics.
