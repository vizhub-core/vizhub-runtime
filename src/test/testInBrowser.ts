import { Browser, Page } from "puppeteer";
import { rollup } from "rollup";
import { expect } from "vitest";
import { buildHTML } from "../index";
import { FileCollection } from "magic-sandbox";

const DEBUG = false;

// Invokes Puppeteer to test the HTML in a browser,
// and isolates the console.log output to check against expectedLog.
export async function testInBrowser(
  browser: Browser,
  files: FileCollection,
  expectedLog: string,
) {
  const page: Page = await browser.newPage();
  try {
    // Capture console.log output
    const logs: string[] = [];
    page.on("console", (message) => logs.push(message.text()));

    // Capture page errors
    page.on("pageerror", (error) => {
      console.error("[testInBrowser] pageerror:", error);
    });

    // Load the HTML
    const html = await buildHTML({ files, rollup });
    await page.setContent(html);

    // Wait a bit for scripts to execute
    await new Promise((resolve) => setTimeout(resolve, 100));

    DEBUG && console.log("[testInBrowser] html:", html);
    DEBUG && console.log("[testInBrowser] logs:", logs);

    // Check console output
    expect(logs).toContain(expectedLog);
  } finally {
    await page.close();
  }
}
