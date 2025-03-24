import puppeteer, { Browser } from "puppeteer";
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
  basicHTML,
  fetchProxy,
  jsScriptTag,
  styleTest,
  xmlTest,
  protocolTest,
} from "./fixtures/v1";
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

describe("VizHub Runtime v1", () => {
  it("should generate srcdoc HTML", async () => {
    const srcdoc = await buildHTML({
      files: basicHTML,
    });
    expect(srcdoc).toContain("<!DOCTYPE html>");
    expect(srcdoc).toContain(
      "<title>My HTML Document</title>",
    );
    expect(srcdoc).toContain("Hello, World!");
  });

  it("basicHTML", async () => {
    await testInBrowser(
      browser,
      basicHTML,
      "Hello, World!",
    );
  });

  it("jsScriptTag", async () => {
    await testInBrowser(browser, jsScriptTag, "Hello, JS!");
  });

  it("fetchProxy", async () => {
    await testInBrowser(
      browser,
      fetchProxy,
      "Hello, Fetch!",
    );
  });

  it("should handle CSS file loading", async () => {
    await testInBrowser(
      browser,
      styleTest,
      "rgb(255, 0, 0)",
    );
  });

  it("should handle XML file loading", async () => {
    await testInBrowser(browser, xmlTest, "root");
  });

  it("should convert protocol-less URLs to https", async () => {
    const srcdoc = await buildHTML({ files: protocolTest });
    expect(srcdoc).toContain(
      'href="https://fonts.googleapis.com',
    );
    expect(srcdoc).toContain(
      'src="https://code.jquery.com',
    );
  });
});
