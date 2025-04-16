import puppeteer, { Browser } from "puppeteer";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
} from "vitest";
import { build } from "../index";
import { testInBrowser } from "./testInBrowser";
import {
  basicHTML,
  fetchProxy,
  jsScriptTag,
  styleTest,
  xmlTest,
  protocolTest,
} from "./fixtures/v1";
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
    const srcdoc = await build({
      files: basicHTML,
    });
    expect(srcdoc).toContain("<!DOCTYPE html>");
    expect(srcdoc).toContain(
      "<title>My HTML Document</title>",
    );
    expect(srcdoc).toContain("Hello, World!");
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
    const srcdoc = await build({ files: protocolTest });
    expect(srcdoc).toContain(
      'href="https://fonts.googleapis.com',
    );
    expect(srcdoc).toContain(
      'src="https://code.jquery.com',
    );
  });
});
