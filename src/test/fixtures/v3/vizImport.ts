import { VizContent } from "@vizhub/viz-types";

// Sample content for testing JS imports
export const sampleContent: VizContent = {
  id: "84bddfb1cc0545f299e5083c3e71e0bb",
  files: {
    "7548392": {
      name: "index.js",
      text: `
        import { innerMessage } from './message';
        export const message = "Outer " + innerMessage;
      `,
    },
    "6714854": {
      name: "message.js",
      text: `
        export const innerMessage = "Inner";
      `,
    },
  },
  title: "Sample Content for Exporting",
};

// Sample content for testing JS imports
// across vizzes by id
export const sampleContentVizImport: VizContent = {
  id: "a6014044e0c6425f911a7e128e1928a6",
  files: {
    "7548392": {
      name: "index.js",
      text: `
        import { message } from '@joe/${sampleContent.id}';
        console.log("Imported from viz: " + message);
      `,
    },
  },
  title: "Sample Content for Viz Importing",
};
// Sample content for testing JS imports
// across vizzes by slug
export const sampleContentVizImportSlug: VizContent = {
  id: "6f8aec8c3cd348d7a7d4661cc8d75c9a",
  files: {
    "7548392": {
      name: "index.js",
      text: `
        import { message } from '@joe/sample-content-slug';
        console.log("Imported from viz with slug: " + message);
      `,
    },
  },
  title: "Sample Content for Viz Importing",
};

// Sample content for testing CSS imports
export const sampleContentWithCSS: VizContent = {
  id: "cd52ba7f80834807b72e66ce4abac185",
  files: {
    "5473849": {
      name: "index.js",
      text: `
        import './styles.css';
      `,
    },
    "0175432": {
      name: "styles.css",
      text: `
        body { color: red; }
      `,
    },
  },
  title: "Sample Content for CSS Importing",
};

// Sample content for testing CSS imports
// across vizzes
export const sampleContentVizImportWithCSS: VizContent = {
  id: "816040d214484b41b653bd6916a11fd9",
  files: {
    "7548392": {
      name: "index.js",
      text: `
        // Import for the CSS side effect
        import '@joe/${sampleContentWithCSS.id}';
      `,
    },
  },
  title: "Sample Content for Viz Importing with CSS",
};

// TODO move this elsewhere, simplify to FileCollection
export const sampleContentSvelte = {
  id: "816040d214484b41b653bd6919a11fd9",
  files: {
    "7548392": {
      name: "App.svelte",
      text: `
        <script>
          const name = "World";
        </script>

        <h1>Hello {name}!</h1>
      `,
    },
    "6714854": {
      name: "index.js",
      text: `
        import App from './App.svelte';

        export const main = (container) => {
          const app = new App({
            target: container,
          });
        };
      `,
    },
  },
  title: "Sample Content for Svelte",
};
