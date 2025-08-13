# Image Support Example

This example demonstrates the image support functionality working across different runtime versions.

## Files

**index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>HTML Starter</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="container">
      <img src="favicon-tiny.jpg" class="centered-image" />
    </div>
    <script type="module" src="index.js"></script>
  </body>
</html>
```

**favicon-tiny.jpg** (base64 content)

```
/9j/4AAQSkZJRgABAQEBLAEsAAD/4RqSRXhpZgAASUkqAAgAAAAIAA4BAgASAAAAbgAAABIBAwABAAAAAQAAABoBBQABAAAAgAAAABsBBQABAAAAiAAAACgBAwABAAAAAgAAADEBAgANAAAAkAAAADIBAgAUAAAAngAAAGmHBAABAAAAsgAAAOoAAABDcmVhdGVkIHdpdGggR0lNUAAsAQAAAQAAACwBAAABAAAAR0lNUCAyLjEwLjMwAAA
```

**index.js**

```javascript
console.log("hello world");
```

**styles.css**

```css
body,
html {
  height: 100%;
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.centered-image {
  max-width: 100%;
  max-height: 100%;
}
```

**README.md**

```
(empty file)
```

## Expected Behavior

When this example is processed by VizHub Runtime:

1. **Runtime Detection**: Since both `index.html` and `index.js` exist, this will be detected as **V2 runtime**
2. **Image Processing**: The `favicon-tiny.jpg` reference in the HTML will be automatically converted to a data URL
3. **Final Output**: The img tag will display the image correctly

## Result

The final HTML will contain:

```html
<img
  src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4RqSRXhpZgAA..."
  class="centered-image"
/>
```

Instead of the original:

```html
<img src="favicon-tiny.jpg" class="centered-image" />
```

This allows the image to display correctly within the sandboxed iframe environment.

## Runtime Support

### V1 Runtime (HTML only)

- ✅ Images referenced in HTML via `<img src="...">` are converted to data URLs
- ✅ Supports: JPG, PNG, GIF, SVG, WebP, BMP formats

### V2 Runtime (HTML + bundled JS)

- ✅ Images referenced in HTML via `<img src="...">` are converted to data URLs
- ✅ JavaScript bundling works alongside image processing
- ✅ All V1 image formats supported

### V3 Runtime (Advanced bundling)

- ✅ Images can be imported in JavaScript: `import logoSrc from './logo.png'`
- ✅ Images are converted to data URLs and exported as JavaScript modules
- ✅ Works with cross-viz imports and state management
- ✅ All image formats supported

### V4 Runtime (ES modules)

- ✅ Images referenced in HTML via `<img src="...">` are converted to data URLs
- ✅ ES module processing works alongside image support
- ✅ Hot reloading preserves image processing

## Technical Implementation

The image support is implemented through:

1. **Image Detection**: Files are identified as images based on their extensions
2. **Data URL Conversion**: Base64 content is converted to appropriate data URLs with correct MIME types
3. **Runtime Integration**: Each runtime version handles images appropriately:
   - V1/V2/V4: HTML processing converts `src` attributes
   - V3: JavaScript import processing exports data URLs
4. **Format Support**: All common web image formats are supported with proper MIME type detection
