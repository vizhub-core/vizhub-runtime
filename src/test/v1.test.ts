import puppeteer, { Browser } from "puppeteer";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
} from "vitest";
import { testInBrowser } from "./testInBrowser";
import {
  basicHTML,
  fetchProxy,
  jsScriptTag,
  styleTest,
  xmlTest,
  protocolTest,
} from "./fixtures/v1";
import { build } from "../build";
// import { JSDOM } from "jsdom";
// import { setJSDOM } from "../common/domParser";

// setJSDOM(JSDOM);

let browser: Browser;

beforeAll(async () => {
  browser = await puppeteer.launch();
});

afterAll(async () => {
  await browser.close();
});

describe("VizHub Runtime v1", () => {
  it("should generate srcdoc HTML", async () => {
    const { html } = await build({
      files: basicHTML,
    });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain(
      "<title>My HTML Document</title>",
    );
    expect(html).toContain("Hello, World!");
  });

  it("basicHTML", async () => {
    await testInBrowser({
      browser,
      files: basicHTML,
      expectedLog: "Hello, World!",
    });
  });

  it("jsScriptTag", async () => {
    await testInBrowser({
      browser,
      files: jsScriptTag,
      expectedLog: "Hello, JS!",
    });
  });

  it("fetchProxy", async () => {
    await testInBrowser({
      browser,
      files: fetchProxy,
      expectedLog: "Hello, Fetch!",
    });
  });

  it("should handle CSS file loading", async () => {
    await testInBrowser({
      browser,
      files: styleTest,
      expectedLog: "rgb(255, 0, 0)",
    });
  });

  it("should handle XML file loading", async () => {
    await testInBrowser({
      browser,
      files: xmlTest,
      expectedLog: "root",
    });
  });

  it("should convert protocol-less URLs to https", async () => {
    const { html } = await build({ files: protocolTest });
    expect(html).toContain(
      'href="https://fonts.googleapis.com',
    );
    expect(html).toContain('src="https://code.jquery.com');
  });
});
