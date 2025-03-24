import puppeteer, { Browser } from "puppeteer";
import { describe, it, beforeAll, afterAll } from "vitest";
import { testInBrowser } from "./testInBrowser";
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
    await testInBrowser(
      browser,
      basicIndexJS,
      "Hello main!",
    );
  });

  it("should handle JS exports", async () => {
    await testInBrowser(browser, jsExport, "Outer Inner");
  });

  it("should handle CSS imports", async () => {
    await testInBrowser(
      browser,
      cssImport,
      "rgb(255, 0, 0)",
    );
  });

  it.skip("should handle CSV imports", async () => {
    await testInBrowser(browser, csvImport, "csv data");
  });

  it.skip("should handle CSV with strange characters", async () => {
    await testInBrowser(
      browser,
      csvStrangeChars,
      "csv strange chars",
    );
  });

  it.skip("should handle viz imports", async () => {
    await testInBrowser(browser, vizImport, "viz import");
  });

  it.skip("should handle viz imports with slug", async () => {
    await testInBrowser(
      browser,
      vizImportSlug,
      "viz import slug",
    );
  });

  it.skip("should handle viz imports with CSS", async () => {
    await testInBrowser(
      browser,
      vizImportWithCSS,
      "viz import with css",
    );
  });

  it.skip("should handle Svelte components", async () => {
    await testInBrowser(
      browser,
      svelte,
      "svelte component",
    );
  });
});
