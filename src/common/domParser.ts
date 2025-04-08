import type { JSDOM } from "jsdom";

let parser: DOMParser;

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

export const getParser = (): DOMParser => {
  if (!parser) {
    throw new Error(
      "DOM parser is not defined. Did you forget to call setJSDOM()?",
    );
  }
  return parser;
};
