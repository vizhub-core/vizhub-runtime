import puppeteer, { Browser } from "puppeteer";
import { rollup } from "rollup";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildHTML } from "../index";
import { testInBrowser } from "./testInBrowser";
import {
  basicBundle,
  d3Import,
  reactImport,
  reactDomImport,
  jsxTranspile,
  es6Preserve,
  generatorSupport,
  unicodeSupport,
} from "./fixtures/v2";

let browser: Browser;

beforeAll(async () => {
  browser = await puppeteer.launch();
});

afterAll(async () => {
  await browser.close();
});

describe("VizHub Runtime v2", () => {
  it("should bundle basic imports", async () => {
    await testInBrowser(browser, basicBundle, "bar");
  });

  it("should support d3 imports", async () => {
    await testInBrowser(browser, d3Import, "function");
  });

  it("should support React imports", async () => {
    await testInBrowser(browser, reactImport, "object");
  });

  it.skip("should support ReactDOM imports", async () => {
    await testInBrowser(browser, reactDomImport, "[object Object]"); // ReactDOM object
  });

  it.skip("should transpile JSX", async () => {
    const srcdoc = await buildHTML({ files: jsxTranspile, rollup });
    expect(srcdoc).toContain("React.createElement");
  });

  it.skip("should preserve ES6 syntax", async () => {
    await testInBrowser(browser, es6Preserve, "16"); // 4 * 4 = 16
  });

  it.skip("should support generator functions", async () => {
    await testInBrowser(browser, generatorSupport, "5");
  });

  it.skip("should support unicode characters", async () => {
    await testInBrowser(browser, unicodeSupport, "Привет");
  });
});
