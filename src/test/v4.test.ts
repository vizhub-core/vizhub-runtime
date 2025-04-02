import puppeteer, { Browser } from "puppeteer";
import { describe, it, beforeAll, afterAll } from "vitest";
import { testInBrowser } from "./testInBrowser";
import {
  jsScriptTagTypeModule,
  jsScriptTagTypeModules,
  fetchInterception,
  esmBuild,
  reactJsx,
  d3Usage,
  threeJsUsage,
  reactHooks,
  typeScriptSupport,
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

  it.skip("should handle ESM builds from npm packages", async () => {
    await testInBrowser({
      browser,
      files: esmBuild,
      expectedLog: new RegExp(/\d{4}-\d{2}-\d{2}/), // matches date format yyyy-MM-dd
    });
  });

  it.skip("should handle React JSX", async () => {
    await testInBrowser({
      browser,
      files: reactJsx,
      expectedLog: "Hello React JSX!",
      evaluateInBrowser: async (page) => {
        return await page.evaluate(() => {
          return document.querySelector("#root div")
            ?.textContent;
        });
      },
    });
  });

  it.skip("should handle D3 usage", async () => {
    await testInBrowser({
      browser,
      files: d3Usage,
      expectedLog: "D3 chart rendered successfully",
      evaluateInBrowser: async (page) => {
        return await page.evaluate(() => {
          return (
            document.querySelector("#chart svg circle") !==
            null
          );
        });
      },
    });
  });

  it("should handle Three.js usage", async () => {
    await testInBrowser({
      browser,
      files: threeJsUsage,
      expectedLog: "Three.js imports: object function",
    });
  });

  it.skip("should handle React hooks", async () => {
    await testInBrowser({
      browser,
      files: reactHooks,
      expectedLog: "React Hooks working: count is 0",
      evaluateInBrowser: async (page) => {
        return await page.evaluate(() => {
          return (
            document.querySelector("#root p")
              ?.textContent === "You clicked 0 times"
          );
        });
      },
    });
  });

  it.skip("should handle TypeScript support", async () => {
    await testInBrowser({
      browser,
      files: typeScriptSupport,
      expectedLog: "TypeScript is working",
      evaluateInBrowser: async (page) => {
        return await page.evaluate(() => {
          return (
            document.querySelector("#app h1")
              ?.textContent === "Hello, John Doe!"
          );
        });
      },
    });
  });
});
