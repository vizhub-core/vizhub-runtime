import { describe, it, expect } from "vitest";
import { computeSrcDoc } from "./index";
import puppeteer, { Browser, Page } from "puppeteer";
import { basicHTML, jsScriptTag } from "./fixtures";

async function testInBrowser(html: string, expectedLog: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Capture console.log output
    const logs: string[] = [];
    page.on("console", (message) => logs.push(message.text()));

    // Load the HTML
    await page.setContent(computeSrcDoc(html));

    // Wait a bit for scripts to execute
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check console output
    expect(logs).toContain(expectedLog);
  } finally {
    await browser.close();
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
});
