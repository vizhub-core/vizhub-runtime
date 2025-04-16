import { getFileText } from "@vizhub/viz-utils";

// Simple srcdoc generator
// TODO: Make this more robust, handle CSS loading errors, etc.
export const generateSrcdoc = ({
  js,
  cssFiles,
  getFileContent, // Function to fetch CSS content by fileId
}: {
  js: string;
  cssFiles: string[];
  getFileContent: (
    fileId: string,
  ) => Promise<string | null>;
}): string => {
  // Basic HTML structure
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style id="vizhub-styles"></style> <!-- Placeholder for CSS -->
</head>
<body>
  <div id="root"></div>
  <script>
    // Simple state management for hot reloading
    let vizState = window.vizState || {};
    const setState = (newStateFn) => {
      vizState = newStateFn(vizState);
      // Optionally re-render or notify components here if needed
      console.log('State updated:', vizState);
    };

    // Store functions to manage CSS injection/removal
    const injectedCSS = new Map();
    const injectCSS = (id, src) => {
      let styleElement = injectedCSS.get(id);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.setAttribute('data-vizhub-css-id', id);
        document.head.appendChild(styleElement);
        injectedCSS.set(id, styleElement);
      }
      styleElement.textContent = src;
      console.log('Injected CSS:', id);
    };
    const removeCSS = (id) => {
       const styleElement = injectedCSS.get(id);
       if (styleElement) {
         styleElement.remove();
         injectedCSS.delete(id);
         console.log('Removed CSS:', id);
       }
    };

    // Function to run the main JS bundle
    const runJS = (src) => {
      console.log('Running JS...');
      try {
        // Preserve state across runs
        window.vizState = vizState;
        // Use Function constructor for better isolation and sourcemap handling
        const mainFn = new Function('container', 'runtimeOptions', src);
        // Execute the bundle
        mainFn(document.getElementById('root'), { state: vizState, setState });
        window.parent.postMessage({ type: 'runDone' }, '*');
        console.log('Run finished.');
      } catch (error) {
        console.error('Runtime Error:', error);
        window.parent.postMessage({ type: 'runError', error: { message: error.message, stack: error.stack } }, '*');
      }
    };

    // Listen for messages from the parent window (for hot reloading)
    window.addEventListener('message', (event) => {
      // Basic security check
      // if (event.origin !== window.location.origin) return;

      const { type, src, id } = event.data;
      if (type === 'runJS') {
        runJS(src);
      } else if (type === 'runCSS') {
        if (src) {
          injectCSS(id, src);
        } else {
          removeCSS(id);
        }
      }
    });

    // Initial JS execution
    // We embed the initial JS directly here
    // Note: Sourcemaps might require more setup if using Function constructor like this
    // Consider using eval() or script tag injection if sourcemaps are critical here.
    // For now, let's embed it.
    const initialJSSrc = ${JSON.stringify(js)};
    runJS(initialJSSrc);

  </script>
</body>
</html>
`;

  // Inject initial CSS (this part is tricky as it requires async fetching)
  // For simplicity in this initial implementation, we'll rely on the runtime
  // sending `runCSS` messages *after* the srcdoc is set.
  // A more robust solution might involve embedding initial CSS directly
  // or having the iframe fetch it.

  return html;
};

// Helper to parse ID (copied from createRuntime for now)
const parseId = (
  fileId: string,
): { vizId?: string; fileName: string } => {
  const parts = fileId.split("/");
  if (parts.length > 1) {
    return {
      vizId: parts[0],
      fileName: parts.slice(1).join("/"),
    };
  }
  return { fileName: fileId };
};
