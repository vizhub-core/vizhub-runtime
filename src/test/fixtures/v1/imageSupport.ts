export const imageInHTML = {
  "index.html": `<!DOCTYPE html>
<html>
  <head>
    <title>Image Test</title>
  </head>
  <body>
    <h1>Image Display Test</h1>
    <img src="favicon-tiny.jpg" alt="Tiny favicon" class="centered-image" />
    <img src="test-icon.png" alt="Test icon" />
  </body>
</html>`,
  "favicon-tiny.jpg": "/9j/4AAQSkZJRgABAQEBLAEsAAD/4RqSRXhpZgAASUkqAAgAAAAIAA4BAgASAAAAbgAAABIBAwABAAAAAQAAABoBBQABAAAAgAAAABsBBQABAAAAiAAAACgBAwABAAAAAgAAADEBAgANAAAAkAAAADIBAgAUAAAAngAAAGmHBAABAAAAsgAAAOoAAABDcmVhdGVkIHdpdGggR0lNUAAsAQAAAQAAACwBAAABAAAAR0lNUCAyLjEwLjMwAAA",
  "test-icon.png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
};

export const svgInHTML = {
  "index.html": `<!DOCTYPE html>
<html>
  <body>
    <img src="icon.svg" alt="SVG Icon" />
  </body>
</html>`,
  "icon.svg": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>'
};

export const noImagesHTML = {
  "index.html": `<!DOCTYPE html>
<html>
  <body>
    <h1>No images here</h1>
    <img src="external-image.jpg" alt="External image" />
  </body>
</html>`
};

export const mixedContentHTML = {
  "index.html": `<!DOCTYPE html>
<html>
  <head>
    <style>
      .container { text-align: center; }
      .logo { width: 100px; height: 100px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Mixed Content</h1>
      <img src="logo.png" alt="Logo" class="logo" />
      <p>Some text content</p>
      <img src="missing-image.jpg" alt="Missing" />
      <img src="icon.gif" alt="GIF icon" />
    </div>
    <script>
      console.log('Mixed content page loaded');
    </script>
  </body>
</html>`,
  "logo.png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  "icon.gif": "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
};