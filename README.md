# @vizhub/runtime

[![NPM version](https://img.shields.io/npm/v/@vizhub/runtime.svg)](https://www.npmjs.com/package/@vizhub/runtime)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful, flexible runtime environment for executing code sandboxes in the browser. `@vizhub/runtime` powers [VizHub](https://vizhub.com/) and can be used to build similar interactive coding platforms.

## Overview

`@vizhub/runtime` intelligently detects the appropriate runtime version based on the provided files and generates executable HTML that can be used within an iframe's `srcdoc` attribute. It handles everything from simple HTML/JS/CSS combinations to complex module bundling, dependency resolution, and cross-viz imports.

## Key Features

- **Multi-Version Runtime Support**

  - **v1**: Simple HTML execution with fetch proxying
  - **v2**: JavaScript bundling with Rollup, JSX support, and CDN-based dependency resolution
  - **v3**: Advanced module bundling with Svelte support and cross-viz imports
  - **v4**: Modern ES Modules with import maps for direct browser execution

- **Comprehensive Tooling**

  - **Bundling**: Seamless integration with Rollup for module bundling
  - **Transpilation**: Support for JSX (v2) and Svelte components (v3)
  - **Dependency Management**: Automatic resolution via CDNs (jsDelivr/unpkg)
  - **Caching**: Efficient viz content and slug resolution caching
  - **Debugging**: Sourcemap generation for improved debugging experience

- **Advanced Capabilities**
  - **Cross-Viz Imports**: Import code from other viz instances using `@username/vizIdOrSlug` syntax
  - **Fetch Interception**: Handle cross-origin requests and authentication
  - **File Type Support**: Process JS, JSX, CSS, CSV, JSON, and more

## Installation

```bash
npm install @vizhub/runtime
```

## Usage

### Basic Usage

```javascript
import { buildHTML } from '@vizhub/runtime';
import { rollup } from 'rollup';

// Simple v1 runtime (HTML only)
const html = await buildHTML({
  files: {
    'index.html': '<html><body><h1>Hello World</h1></body></html>'
  }
});

// v2 runtime with bundling
const html = await buildHTML({
  files: {
    'index.html': '<html><body><div id="root"></div><script src="bundle.js"></script></body></html>',
    'index.js': 'import { message } from "./message"; console.log(message);',
    'message.js': 'export const message = "Hello, bundled world!";'
  },
  rollup
});

// Use the generated HTML in an iframe
const iframe = document.createElement('iframe');
iframe.srcdoc = html;
document.body.appendChild(iframe);
```

### Runtime Versions

The library automatically detects which runtime version to use based on the files provided:

- **v1**: When only `index.html` is present
- **v2**: When both `index.html` and `index.js` (or `index.jsx`) are present
- **v3**: When only `index.js` is present (no `index.html`)
- **v4**: When `index.html` contains ES module scripts with import maps

### Advanced Usage: v3 Runtime with Cross-Viz Imports

```javascript
import { buildHTML, createVizCache, createSlugCache } from '@vizhub/runtime';
import { rollup } from 'rollup';
import { compile } from 'svelte/compiler';

// Create caches for viz content and slug resolution
const vizCache = createVizCache({
  initialContents: [
    {
      id: 'viz-123',
      files: {
        'file1': { name: 'index.js', text: 'export const value = 42;' }
      }
    }
  ],
  handleCacheMiss: async (vizId) => {
    // Fetch viz content from your backend
    return await fetchVizContent(vizId);
  }
});

const slugCache = createSlugCache({
  initialMappings: {
    'username/my-viz': 'viz-123'
  },
  handleCacheMiss: async (slug) => {
    // Resolve slug to vizId from your backend
    return await resolveSlug(slug);
  }
});

// Build HTML with cross-viz imports
const html = await buildHTML({
  files: {
    'index.js': 'import { value } from "@username/my-viz"; console.log(value);'
  },
  rollup,
  vizCache,
  vizId: 'current-viz-id',
  slugCache,
  getSvelteCompiler: async () => compile
});
```

## API Reference

### buildHTML(options)

Builds HTML that can be used as the `srcdoc` of an iframe.

#### Options

- **files**: `FileCollection` - A map of filenames to their contents
- **rollup**: `(options: RollupOptions) => Promise<RollupBuild>` - Rollup function (required for v2, v3, v4)
- **enableSourcemap**: `boolean` - Whether to include sourcemaps (default: true)
- **vizCache**: `VizCache` - Cache for viz content (required for v3 with cross-viz imports)
- **vizId**: `string` - ID of the current viz (required for v3 with cross-viz imports)
- **slugCache**: `SlugCache` - Cache for slug resolution (optional for v3)
- **getSvelteCompiler**: `() => Promise<SvelteCompiler>` - Function that returns Svelte compiler (optional for v3)

### createVizCache(options)

Creates a cache for viz content.

#### Options

- **initialContents**: `VizContent[]` - Initial viz contents to populate the cache
- **handleCacheMiss**: `(vizId: string) => Promise<VizContent>` - Function to handle cache misses

### createSlugCache(options)

Creates a cache for slug resolution.

#### Options

- **initialMappings**: `Record<string, string>` - Initial slug to vizId mappings
- **handleCacheMiss**: `(slug: string) => Promise<string>` - Function to handle cache misses

## Examples

### v1: Simple HTML

```javascript
const html = await buildHTML({
  files: {
    'index.html': `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: sans-serif; }
          </style>
        </head>
        <body>
          <h1>Hello World</h1>
          <script>
            console.log('Hello from v1 runtime!');
          </script>
        </body>
      </html>
    `
  }
});
```

### v2: Bundled JavaScript

```javascript
const html = await buildHTML({
  files: {
    'index.html': `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="root"></div>
          <script src="bundle.js"></script>
        </body>
      </html>
    `,
    'index.js': `
      import { render } from './render';
      render(document.getElementById('root'));
    `,
    'render.js': `
      export function render(element) {
        element.innerHTML = '<h1>Hello from v2 runtime!</h1>';
      }
    `,
    'package.json': JSON.stringify({
      dependencies: {
        'd3': '7.8.5'
      }
    })
  },
  rollup
});
```

### v4: ES Modules with Import Maps

```javascript
const html = await buildHTML({
  files: {
    'index.html': `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="importmap">
            {
              "imports": {
                "utils": "./utils.js"
              }
            }
          </script>
        </head>
        <body>
          <div id="app"></div>
          <script type="module" src="index.js"></script>
        </body>
      </html>
    `,
    'index.js': `
      import { createApp } from 'utils';
      createApp(document.getElementById('app'));
    `,
    'utils.js': `
      export function createApp(element) {
        element.innerHTML = '<h1>Hello from v4 runtime!</h1>';
      }
    `
  },
  rollup
});
```

## Development

### Setup

```bash
git clone https://github.com/vizhub-core/vizhub-runtime.git
cd vizhub-runtime
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

Run specific tests:

```bash
npx vitest run -t "should handle CSS imports"
```

### Type Checking

```bash
npm run typecheck
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
