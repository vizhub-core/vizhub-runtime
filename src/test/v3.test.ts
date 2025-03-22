import puppeteer, { Browser } from "puppeteer";
import { describe, it, beforeAll, afterAll } from "vitest";
import { testInBrowser } from "./testInBrowser";
import { basicIndexJS } from "./fixtures/v3";

let browser: Browser;

beforeAll(async () => {
  browser = await puppeteer.launch();
});

afterAll(async () => {
  await browser.close();
});

describe("VizHub Runtime v3", () => {
  it.skip("should bundle basic imports", async () => {
    await testInBrowser(browser, basicIndexJS, "bar");
  });
});
