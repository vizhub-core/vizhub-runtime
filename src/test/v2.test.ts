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
  syntaxError,
} from "./fixtures/v2";
import { JSDOM } from "jsdom";
import { setJSDOM } from "../common/domParser";

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
    await testInBrowser({
      browser,
      files: basicBundle,
      expectedLog: "bar",
    });
  });

  it("should bundle basic imports missing .js extension", async () => {
    await testInBrowser({
      browser,
      files: basicBundleNoExtension,
      expectedLog: "bar",
    });
  });

  it("should support d3 imports", async () => {
    await testInBrowser({
      browser,
      files: d3Import,
      expectedLog: "function",
    });
  });

  it("should support d3 imports from packages", async () => {
    await testInBrowser({
      browser,
      files: d3ImportPkg,
      expectedLog: "function",
    });
  });

  it("should support React imports", async () => {
    await testInBrowser({
      browser,
      files: reactImport,
      expectedLog: "object",
    });
  });

  it("should support React imports from packages", async () => {
    await testInBrowser({
      browser,
      files: reactImportPkg,
      expectedLog: "object",
    });
  });

  it("should support ReactDOM imports", async () => {
    await testInBrowser({
      browser,
      files: reactDomImport,
      expectedLog: "object",
    });
  });

  it("should support ReactDOM imports from packages", async () => {
    await testInBrowser({
      browser,
      files: reactDomImportPkg,
      expectedLog: "object",
    });
  });

  it("should transpile JSX", async () => {
    const srcdoc = await buildHTML({
      files: jsxTranspile,
      rollup,
    });
    expect(srcdoc).toContain("React.createElement");
  });

  it("should preserve ES6 syntax", async () => {
    await testInBrowser({
      browser,
      files: es6Preserve,
      expectedLog: "16", // 4 * 4 = 16
    });
  });

  it("should support generator functions", async () => {
    await testInBrowser({
      browser,
      files: generatorSupport,
      expectedLog: "5",
    });
  });

  it("should support unicode characters", async () => {
    await testInBrowser({
      browser,
      files: unicodeSupport,
      expectedLog: "Привет",
    });
  });

  it("should handle globals config for arbitrary package d3-rosetta", async () => {
    await testInBrowser({
      browser,
      files: d3RosettaImportPkg,
      expectedLog: "function",
    });
  });

  it("should handle syntax error", async () => {
    await expect(
      testInBrowser({
        browser,
        files: syntaxError,
        expectedLog: "function",
      }),
    ).rejects.toThrow(
      /Error transforming foo\.js: Unexpected token/,
    );
  });
});
