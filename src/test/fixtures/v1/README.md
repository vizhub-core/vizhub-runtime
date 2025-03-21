The VizHub Runtime version 0 (v0) is a simple runtime for running JavaScript code in a web page. It is designed to be easy to use and understand, and it is suitable for beginners and for simple projects. It is the bare bones functionaloity of VizHub, and it is not recommended for more advanced projects.

It's based on exposing the features of [Magic Sandbox](https://www.npmjs.com/package/magic-sandbox), which supports:

- `index.html` - the main HTML file
- `<script>` tags in the HTML file that refer to local files
- `<script type="module">` preservation
- `<link rel="stylesheet">` tags in the HTML file that refer to local files
- Interception of `fetch` and `XMLHttpRequest` requests
