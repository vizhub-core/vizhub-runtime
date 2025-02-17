import puppeteer, { Browser } from "puppeteer";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { VizFiles } from "@vizhub/viz-types";
import { computeSrcDoc } from "./index";
import { basicHTML, fetchProxy, jsScriptTag } from "./fixtures";

let browser: Browser;

beforeAll(async () => {
  browser = await puppeteer.launch();
});

afterAll(async () => {
  await browser.close();
});

async function testInBrowser(files: VizFiles, expectedLog: string) {
  const page = await browser.newPage();
  try {
    // Capture console.log output
    const logs: string[] = [];
    page.on("console", (message) => logs.push(message.text()));

    // Load the HTML
    await page.setContent(computeSrcDoc(files));

    // Wait a bit for scripts to execute
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check console output
    expect(logs).toContain(expectedLog);
  } finally {
    await page.close();
  }
}

describe("VizHub Runtime", () => {
  it("should generate srcdoc HTML", () => {
    const srcdoc = computeSrcDoc(basicHTML);
    expect(srcdoc).toContain("<!DOCTYPE html>");
    expect(srcdoc).toContain("<title>My HTML Document</title>");
    expect(srcdoc).toContain("Hello, World!");
  });

  it("basicHTML", async () => {
    await testInBrowser(basicHTML, "Hello, World!");
  });

  it("jsScriptTag", async () => {
    await testInBrowser(jsScriptTag, "Hello, JS!");
  });

  it("fetchProxy", async () => {
    await testInBrowser(fetchProxy, "Hello, Fetch!");
  });
});
