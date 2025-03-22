import { describe, it, expect } from "vitest";
import { getComputedIndexHtml, setJSDOM } from "./getComputedIndexHtml";
import { FileCollection } from "../types";
import { JSDOM } from "jsdom";
import { d3ImportPkg } from "../test/fixtures/v2/d3ImportPkg";

setJSDOM(JSDOM);

describe("v2 getComputedIndexHtml", () => {
  it("should return empty string if missing index.html", async () => {
    const files: FileCollection = {};
    expect(getComputedIndexHtml(files)).toEqual(``);
  });

  it("should preserve existing index.html if no bundle and no package.json", async () => {
    const text =
      "<!DOCTYPE html><html><head></head><body><h1>Hello World</h1></body></html>";
    const files: FileCollection = { "index.html": text };
    expect(getComputedIndexHtml(files)).toEqual(text);
  });

  it("should add bundle.js, no package.json", async () => {
    const text =
      '<!DOCTYPE html><html><head></head><body><script src="bundle.js"></script></body></html>';
    const files: FileCollection = {
      "index.html": text,
      "index.js": 'console.log("Hello")',
    };
    // console.log(JSON.stringify(getComputedIndexHtml(files), null, 2));
    expect(getComputedIndexHtml(files)).toEqual(text);
  });

  it("should handle d3 dependency from package.json", async () => {
    const files: FileCollection = d3ImportPkg;
    const result = getComputedIndexHtml(files);
    
    // Create a DOM to parse and check the result
    const dom = new JSDOM(result);
    const document = dom.window.document;
    
    // Check that we have the d3 script in the head
    const d3Script = document.querySelector('head script[src*="d3@6.7.0"]');
    expect(d3Script).not.toBeNull();
    
    // Check that we have the bundle.js script in the body
    const bundleScript = document.querySelector('body script[src="bundle.js"]');
    expect(bundleScript).not.toBeNull();
    
    // Verify the order: d3 in head, bundle.js in body
    expect(result.indexOf('d3@6.7.0')).toBeLessThan(result.indexOf('<body>'));
    expect(result.indexOf('<body>')).toBeLessThan(result.indexOf('bundle.js'));
  });
});
