import puppeteer, { Browser } from "puppeteer";
import { describe, it, beforeAll, afterAll } from "vitest";
import {
  testInBrowser,
  testStackTrace,
} from "./testInBrowser";
import {
  basicIndexJS,
  jsExport,
  cssImport,
  csvImport,
  csvStrangeChars,
  vizImport,
  vizImportSlug,
  vizImportWithCSS,
  svelte,
} from "./fixtures/v3";
import { setJSDOM } from "../v2/getComputedIndexHtml";
import { JSDOM } from "jsdom";

setJSDOM(JSDOM);

let browser: Browser;

beforeAll(async () => {
  browser = await puppeteer.launch();
});

afterAll(async () => {
  await browser.close();
});

describe("VizHub Runtime v3", () => {
  it("should run main without index.html", async () => {
    await testInBrowser({
      browser,
      files: basicIndexJS,
      expectedLog: "Hello main!",
    });
  });

  it("should handle JS exports", async () => {
    await testInBrowser({
      browser,
      files: jsExport,
      expectedLog: "Outer Inner",
    });
  });

  it("should handle CSS imports", async () => {
    await testInBrowser({
      browser,
      files: cssImport,
      expectedLog: "rgb(255, 0, 0)",
    });
  });

  it.skip("should handle CSV imports", async () => {
    await testInBrowser({
      browser,
      files: csvImport,
      expectedLog: "csv data",
    });
  });

  it.skip("should handle CSV with strange characters", async () => {
    await testInBrowser({
      browser,
      files: csvStrangeChars,
      expectedLog: "csv strange chars",
    });
  });

  it.skip("should handle viz imports", async () => {
    await testInBrowser({
      browser,
      files: vizImport,
      expectedLog: "viz import",
    });
  });

  it.skip("should handle viz imports with slug", async () => {
    await testInBrowser({
      browser,
      files: vizImportSlug,
      expectedLog: "viz import slug",
    });
  });

  it.skip("should handle viz imports with CSS", async () => {
    await testInBrowser({
      browser,
      files: vizImportWithCSS,
      expectedLog: "viz import with css",
    });
  });

  it.skip("should handle Svelte components", async () => {
    await testInBrowser({
      browser,
      files: svelte,
      expectedLog: "svelte component",
    });
  });

  it.skip("should provide sourcemaps with correct line numbers in stack traces", async () => {
    await testStackTrace(browser, cssImport);
  });
});
