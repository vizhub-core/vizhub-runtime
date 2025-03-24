import {
  dependencies,
  getConfiguredLibraries,
  dependencySource,
} from "../common/packageJson";
import type { JSDOM } from "jsdom";
import { FileCollection } from "../types";

let parser: DOMParser;

const DEBUG = false;

// Expose a way to inject a DOMParser implementation
// when we're in a Node environment (tests, API server).
export const setJSDOM = (
  JSDOMInstance: typeof JSDOM,
): void => {
  const dom = new JSDOMInstance();
  parser = new dom.window.DOMParser();
};

// If we're in the browser, use native DOMParser.
if (typeof window !== "undefined") {
  parser = new DOMParser();
}

const injectScripts = (
  htmlTemplate: string,
  files: FileCollection,
) => {
  if (!parser) {
    throw new Error(
      "DOM parser is not defined. Did you forget to call setJSDOM()?",
    );
  }

  const doc = parser.parseFromString(
    htmlTemplate,
    "text/html",
  );

  // Ensure we have a head element
  if (!doc.head) {
    const head = doc.createElement("head");
    doc.documentElement.insertBefore(
      head,
      doc.documentElement.firstChild,
    );
  }

  // Ensure we have a body element
  if (!doc.body) {
    const body = doc.createElement("body");
    doc.documentElement.appendChild(body);
  }

  // Handle dependencies first (in head)
  const deps: [string, string][] = Object.entries(
    dependencies(files),
  );
  if (deps.length > 0) {
    const libraries = getConfiguredLibraries(files);

    // Remove any existing dependency scripts
    deps.forEach(([name]) => {
      const selector = `script[src*="${name}@"]`;
      const existingScripts =
        doc.querySelectorAll(selector);
      existingScripts.forEach((script) => script.remove());
    });

    // Add dependency scripts in order
    deps
      .map(([name, version]) =>
        dependencySource({ name, version }, libraries),
      )
      .forEach((url) => {
        const scriptTag = doc.createElement("script");
        scriptTag.src = url;
        doc.head.appendChild(scriptTag);
      });
  }

  // Handle bundle.js (in body)
  if (files["bundle.js"] || files["index.js"]) {
    // Remove any existing bundle.js script tags
    const existingScripts = doc.querySelectorAll(
      'script[src="bundle.js"]',
    );
    existingScripts.forEach((script) => script.remove());

    const bundleScriptTag = doc.createElement("script");
    bundleScriptTag.src = "bundle.js";
    doc.body.appendChild(bundleScriptTag);
  }

  return `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
};

// Compute the index.html file from the files.
// Includes:
// - bundle.js script tag
// - dependencies script tag(s)
export const getComputedIndexHtml = (
  files: FileCollection,
): string => {
  // Isolate the index.html file.
  const htmlTemplate = files["index.html"];

  // If there is no index.html file, return an empty string.
  if (
    !htmlTemplate &&
    !files["index.js"] &&
    !files["bundle.js"]
  ) {
    DEBUG &&
      console.log(
        "[getComputedIndexHtml] No index.html file found",
      );
    return "";
  }

  // If index.html is empty but we have JS files, create a minimal HTML template
  const template =
    htmlTemplate ||
    "<!DOCTYPE html><html><head></head><body></body></html>";

  const indexHtml = injectScripts(template, files);

  DEBUG &&
    console.log(
      "[getComputedIndexHtml] indexHtml",
      indexHtml,
    );

  return indexHtml;
};
