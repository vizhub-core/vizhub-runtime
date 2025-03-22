import {
  dependencies,
  getConfiguredLibraries,
  dependencySource,
} from "./packageJson";
import type { JSDOM } from "jsdom";

let parser: DOMParser;

// Expose a way to inject a DOMParser implementation
// when we're in a Node environment (tests, API server).
export const setJSDOM = (JSDOMInstance: typeof JSDOM): void => {
  const dom = new JSDOMInstance();
  parser = new dom.window.DOMParser();
};

// If we're in the browser, use native DOMParser.
if (typeof window !== "undefined") {
  parser = new DOMParser();
}

const injectBundleScript = (htmlTemplate: string, files: FileCollection) => {
  if (!parser) {
    throw new Error("DOM parser is not defined. Did you forget to call setJSDOM()?");
  }

  const doc = parser.parseFromString(htmlTemplate, "text/html");
  
  // Always inject bundle.js if it exists, even if there's already a script tag
  if (files["bundle.js"]) {
    // Remove any existing bundle.js script tags
    const existingScripts = doc.querySelectorAll('script[src="bundle.js"]');
    existingScripts.forEach(script => script.remove());
    
    const bundleScriptTag = doc.createElement("script");
    bundleScriptTag.src = "bundle.js";
    doc.body.appendChild(bundleScriptTag);
  }
  
  return `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
};

const injectDependenciesScript = (
  htmlTemplate: string,
  files: FileCollection,
) => {
  const deps: [string, string][] = Object.entries(dependencies(files) || {});

  if (deps.length === 0) return htmlTemplate;

  if (!parser) {
    throw new Error("DOM parser is not defined. Did you forget to call setJSDOM()?");
  }

  const doc = parser.parseFromString(htmlTemplate, "text/html");
  const libraries = getConfiguredLibraries(files);

  // Ensure we have a head element
  if (!doc.head) {
    const head = doc.createElement('head');
    doc.documentElement.insertBefore(head, doc.documentElement.firstChild);
  }

  // Remove any existing dependency scripts
  deps.forEach(([name]) => {
    const selector = `script[src*="${name}@"]`;
    const existingScripts = doc.querySelectorAll(selector);
    existingScripts.forEach(script => script.remove());
  });

  // Add dependency scripts in order
  deps
    .map(([name, version]) => dependencySource({ name, version }, libraries))
    .forEach((url) => {
      const scriptTag = doc.createElement("script");
      scriptTag.src = url;
      doc.head.appendChild(scriptTag);
    });

  return `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
};

// Compute the index.html file from the files.
// Includes:
// - bundle.js script tag
// - dependencies script tag(s)
import { FileCollection } from "../types";

export const getComputedIndexHtml = (files: FileCollection): string => {
  // Isolate the index.html file.
  const htmlTemplate = files["index.html"];

  // If there is no index.html file, return an empty string.
  if (!htmlTemplate) {
    return "";
  }

  // Inject bundle.js script tag if needed.
  const htmlWithBundleScriptTemplate = injectBundleScript(htmlTemplate, files);

  // Inject dependencies script tag(s) if needed, based on package.json.
  const indexHtml = injectDependenciesScript(
    htmlWithBundleScriptTemplate,
    files,
  );

  return indexHtml;
};
