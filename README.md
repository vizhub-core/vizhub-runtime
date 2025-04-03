# @vizhub/runtime

[![NPM version](https://img.shields.io/npm/v/@vizhub/runtime.svg)](https://www.npmjs.com/package/@vizhub/runtime)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful, flexible runtime environment for executing code sandboxes in the browser. `@vizhub/runtime` powers [VizHub](https://vizhub.com/) and can be used to build similar interactive coding platforms.

## Overview

`@vizhub/runtime` intelligently detects the appropriate runtime version based on the provided files and generates executable HTML that can be used within an iframe's `srcdoc` attribute. It handles everything from simple HTML/JS/CSS combinations to complex module bundling, dependency resolution, and cross-viz imports.

## Runtime Versions

The library automatically detects which runtime version to use based on the files provided:

- **v1**: When only `index.html` is present
- **v2**: When both `index.html` and `index.js` (or `index.jsx`) are present
- **v3**: When only `index.js` is present (no `index.html`)
- **v4**: When `index.html` contains ES module scripts with import maps

## V1 Runtime

The V1 runtime is the simplest version, designed for basic HTML, CSS, and JavaScript projects. This runtime is automatically selected when your project contains only an `index.html` file.

### How It Works

In V1 runtime:

- Your `index.html` file is executed directly in the browser
- You can include inline JavaScript and CSS within your HTML file
- The runtime provides fetch request proxying to handle cross-origin requests

### Example Usage

As a VizHub user, you simply need to create an `index.html` file containing your entire project:

**index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: sans-serif;
      }
    </style>
  </head>
  <body>
    <h1>Hello World</h1>
    <script>
      console.log("Hello from V1 runtime!");
    </script>
  </body>
</html>
```

V1 is ideal for simple demonstrations or when you want complete control over your HTML structure.

## V2 Runtime

The V2 runtime introduces JavaScript bundling with Rollup, JSX support, and CDN-based dependency resolution. This runtime is automatically selected when your project contains both an `index.html` and an `index.js` (or `index.jsx`) file.

### How It Works

In V2 runtime:

- Your JavaScript files are bundled together using Rollup
- Internally, a file named `bundle.js` is created
- The `index.html` file references this `bundle.js` file
- You can use ES6 modules to import/export code
- JSX syntax is supported for React development
- Dependencies listed in `package.json` are automatically resolved via CDNs (jsDelivr/unpkg)
- The bundled JavaScript is referenced in your HTML file

### Example Usage

As a VizHub user, you'll typically create:

1. An `index.html` file that references a `bundle.js` file
2. An `index.js` (or `index.jsx`) file as your entry point
3. Additional JavaScript modules as needed
4. A `package.json` file to list dependencies

**index.html**

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
    <script src="bundle.js"></script>
  </body>
</html>
```

**index.js**

```javascript
import { render } from "./render";
render(document.getElementById("root"));
```

**render.js**

```javascript
export function render(element) {
  element.innerHTML = "<h1>Hello from V2 runtime!</h1>";
}
```

**package.json**

```json
{
  "dependencies": {
    "d3": "7.8.5",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

V2 is ideal for more complex projects that require modular JavaScript and external dependencies that provide UMD builds. Note that the V2 runtime does not support ESM builds for external dependencies (see V4 if you need this).

## V3 Runtime

The V3 runtime provides advanced module bundling with Svelte support and cross-viz imports. This runtime is automatically selected when your project contains an `index.js` file but no `index.html` file.

### How It Works

In V3 runtime:

- Your JavaScript modules are bundled together using Rollup
- A default HTML structure is automatically generated
- Svelte components are supported
- Cross-viz imports allow you to import code from other viz instances
- The runtime provides a built-in state management system

### State Management in V3

V3 runtime includes a built-in state management system via the [unidirectional-data-flow](https://www.npmjs.com/package/unidirectional-data-flow) package ([GitHub](https://github.com/vizhub-core/unidirectional-data-flow)). This provides React-like state management capabilities with:

- A `main` entry point
- A minimal state management system based on `state` and `setState`
- Similar semantics to React's `useState` hook: `const [state, setState] = useState({})`
- Automatic re-rendering when state changes

### The Problem: Re-using D3 Rendering Logic Across Frameworks

While frameworks like React, Svelte, Vue, and Angular offer state management and DOM manipulation solutions, D3 excels in data transformation and visualization, particularly with axes, transitions, and behaviors (e.g. zoom, drag, and brush). These D3 features require direct access to the DOM, making it challenging to replicate them effectively within frameworks.

### The Solution: Unidirectional Data Flow

Unidirectional data flow is a pattern that can be cleanly invoked from multiple frameworks. In this paradigm, a single function is responsible for updating the DOM or rendering visuals based on a single, central state. As the state updates, the function re-renders the visualization in an idempotent manner, meaning it can run multiple times without causing side effects. Here's what the entry point function looks like for a D3-based visualization that uses unidirectional data flow:

**index.js**

```js
export const main = (container, { state, setState }) => {
  // Your reusable D3-based rendering logic goes here
};
```

- **`container`**: A DOM element where the visualization will be rendered
- **`state`**: An object representing the current state of the application, initially empty
- **`setState`**: A function that updates the state using immutable update patterns

Whenever `setState` is invoked, `main` re-executes with the new state, ensuring that the rendering logic is both dynamic and responsive.

For cross-viz imports, you can reference other vizzes directly:

**example-with-import.js**

```javascript
// Import from another viz using @username/vizIdOrSlug syntax
import { someFunction } from "@username/my-other-viz";
```

V3 is ideal for modern JavaScript applications that benefit from automatic HTML structure generation and built-in state management. Additional features of V3 include:

- **Cross-Viz Imports**: Import code from other viz instances using `@username/vizIdOrSlug` syntax
- **Import from CSV**: Import CSV files directly into your viz

## V4 Runtime

The V4 runtime leverages modern ES Modules with import maps for direct browser execution. This runtime is automatically selected when your project's `index.html` contains ES module scripts with import maps.

### How It Works

In V4 runtime:

- Native browser ES modules are used without bundling
- Import maps allow you to specify module resolution directly in the browser
- Module paths can be aliased for cleaner imports
- External dependencies can be loaded directly from CDNs

### Example Usage

As a VizHub user, you'll create an `index.html` file with import maps and ES module scripts:

**index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="importmap">
      {
        "imports": {
          "utils": "./utils.js",
          "d3": "https://cdn.jsdelivr.net/npm/d3@7.8.5/+esm"
        }
      }
    </script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="index.js"></script>
  </body>
</html>
```

**index.js**

```javascript
import { createApp } from "utils";
import * as d3 from "d3";

createApp(document.getElementById("app"));
```

**utils.js**

```javascript
export function createApp(element) {
  element.innerHTML = "<h1>Hello from V4 runtime!</h1>";
}
```

V4 is ideal for modern browsers with native ES module support and when you want direct control over module resolution.

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
import { buildHTML } from "@vizhub/runtime";
import { rollup } from "rollup";

// Simple v1 runtime (HTML only)
const html = await buildHTML({
  files: {
    "index.html":
      "<html><body><h1>Hello World</h1></body></html>",
  },
});

// v2 runtime with bundling
const html = await buildHTML({
  files: {
    "index.html":
      '<html><body><div id="root"></div><script src="bundle.js"></script></body></html>',
    "index.js":
      'import { message } from "./message"; console.log(message);',
    "message.js":
      'export const message = "Hello, bundled world!";',
  },
  rollup,
});

// Use the generated HTML in an iframe
const iframe = document.createElement("iframe");
iframe.srcdoc = html;
document.body.appendChild(iframe);
```

### Advanced Usage: v3 Runtime with Cross-Viz Imports

```javascript
import {
  buildHTML,
  createVizCache,
  createSlugCache,
} from "@vizhub/runtime";
import { rollup } from "rollup";
import { compile } from "svelte/compiler";

// Create caches for viz content and slug resolution
const vizCache = createVizCache({
  initialContents: [
    {
      id: "viz-123",
      files: {
        file1: {
          name: "index.js",
          text: "export const value = 42;",
        },
      },
    },
  ],
  handleCacheMiss: async (vizId) => {
    // Fetch viz content from your backend
    return await fetchVizContent(vizId);
  },
});

const slugCache = createSlugCache({
  initialMappings: {
    "username/my-viz": "viz-123",
  },
  handleCacheMiss: async (slug) => {
    // Resolve slug to vizId from your backend
    return await resolveSlug(slug);
  },
});

// Build HTML with cross-viz imports
const html = await buildHTML({
  files: {
    "index.js":
      'import { value } from "@username/my-viz"; console.log(value);',
  },
  rollup,
  vizCache,
  vizId: "current-viz-id",
  slugCache,
  getSvelteCompiler: async () => compile,
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
