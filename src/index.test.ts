import { describe, it, expect } from "vitest";
import { computeSrcDoc } from "./index";
import puppeteer from "puppeteer";
import { basicHTML, jsScriptTag } from "./fixtures";

describe("VizHub Runtime", () => {
  it("should generate srcdoc HTML", () => {
    const srcdoc = computeSrcDoc(basicHTML);
    expect(srcdoc).toContain("<!DOCTYPE html>");
    expect(srcdoc).toContain("<title>My HTML Document</title>");
    expect(srcdoc).toContain("Hello, World!");
  });

  it("basicHTML", async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Capture console.log output
    const logs: string[] = [];
    page.on("console", (message) => logs.push(message.text()));

    // Load the HTML
    await page.setContent(computeSrcDoc(basicHTML));

    // Wait a bit for scripts to execute
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check console output
    expect(logs).toContain("Hello, World!");

    await browser.close();
  });

  it("jsScriptTag", async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Capture console.log output
    const logs: string[] = [];
    page.on("console", (message) => logs.push(message.text()));

    // Load the HTML
    await page.setContent(computeSrcDoc(jsScriptTag));

    // Wait a bit for scripts to execute
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check console output
    expect(logs).toContain("Hello, JS!");

    await browser.close();
  });
});
