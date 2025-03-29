import puppeteer, { Browser } from "puppeteer";
import { describe, it, beforeAll, afterAll } from "vitest";
import { testInBrowser } from "./testInBrowser";
import {
  jsScriptTagTypeModule,
  jsScriptTagTypeModules,
  fetchInterception,
} from "./fixtures/v4";

let browser: Browser;

beforeAll(async () => {
  browser = await puppeteer.launch();
});

afterAll(async () => {
  await browser.close();
});

describe("VizHub Runtime v4", () => {
  it("should handle script type=module with import maps", async () => {
    await testInBrowser({
      browser,
      files: jsScriptTagTypeModule,
      expectedLog: "Hello, ES Module!",
    });
  });

  it("should handle script type=module with file imports", async () => {
    await testInBrowser({
      browser,
      files: jsScriptTagTypeModules,
      expectedLog: "Hello, ES Module File!",
    });
  });

  it("should handle fetch interception", async () => {
    await testInBrowser({
      browser,
      files: fetchInterception,
      expectedLog: "Fetch intercepted successfully",
    });
  });
});
