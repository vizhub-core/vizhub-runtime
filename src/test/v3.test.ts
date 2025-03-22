import puppeteer, { Browser } from "puppeteer";
import { describe, it, beforeAll, afterAll } from "vitest";
import { testInBrowser } from "./testInBrowser";
import { basicIndexJS } from "./fixtures/v3";
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
  it.skip("should run main without index.html", async () => {
    await testInBrowser(browser, basicIndexJS, "bar");
  });
});
