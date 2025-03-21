The VizHub Runtime version 4 (v4) is a more modern and flexible runtime for running JavaScript code in a web page. It embraces the latest Web standards and best practices, and it is suitable for advanced projects. It is based on the idea of supporting ESM builds for third-party libraries, and aims for compatibility with [Vite](https://vitejs.dev/) for the features it supports.

The VizHub Runtime v4 supports:

- `index.html` - the main HTML file
- `<script>` tags in the HTML file that refer to local files
- `<script type="module">` entry points that trigger Rollup bundling
- `<link rel="stylesheet">` tags in the HTML file that refer to local files
- Interception of `fetch` and `XMLHttpRequest` requests
- ESM builds for third-party libraries
