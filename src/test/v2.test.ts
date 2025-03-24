import puppeteer, { Browser } from "puppeteer";
import { rollup } from "rollup";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
} from "vitest";
import { buildHTML } from "../index";
import { testInBrowser } from "./testInBrowser";
import {
  basicBundle,
  d3Import,
  d3ImportPkg,
  reactImport,
  reactImportPkg,
  reactDomImport,
  reactDomImportPkg,
  jsxTranspile,
  es6Preserve,
  generatorSupport,
  unicodeSupport,
  d3RosettaImportPkg,
  basicBundleNoExtension,
} from "./fixtures/v2";
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

describe("VizHub Runtime v2", () => {
  it("should bundle basic imports", async () => {
    await testInBrowser(browser, basicBundle, "bar");
  });

  it("should bundle basic imports missing .js extension", async () => {
    await testInBrowser(
      browser,
      basicBundleNoExtension,
      "bar",
    );
  });

  it("should support d3 imports", async () => {
    await testInBrowser(browser, d3Import, "function");
  });

  it("should support d3 imports from packages", async () => {
    await testInBrowser(browser, d3ImportPkg, "function");
  });

  it("should support React imports", async () => {
    await testInBrowser(browser, reactImport, "object");
  });

  it("should support React imports from packages", async () => {
    await testInBrowser(browser, reactImportPkg, "object");
  });

  it("should support ReactDOM imports", async () => {
    await testInBrowser(browser, reactDomImport, "object");
  });

  it("should support ReactDOM imports from packages", async () => {
    await testInBrowser(
      browser,
      reactDomImportPkg,
      "object",
    );
  });

  it("should transpile JSX", async () => {
    const srcdoc = await buildHTML({
      files: jsxTranspile,
      rollup,
    });
    expect(srcdoc).toContain("React.createElement");
  });

  it("should preserve ES6 syntax", async () => {
    await testInBrowser(browser, es6Preserve, "16"); // 4 * 4 = 16
  });

  it("should support generator functions", async () => {
    await testInBrowser(browser, generatorSupport, "5");
  });

  it("should support unicode characters", async () => {
    await testInBrowser(browser, unicodeSupport, "Привет");
  });

  it("should handle globals config for arbitrary package d3-rosetta", async () => {
    await testInBrowser(
      browser,
      d3RosettaImportPkg,
      "function",
    );
  });
});
