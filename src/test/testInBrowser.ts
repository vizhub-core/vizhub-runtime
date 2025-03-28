import { Browser, Page } from "puppeteer";
import { rollup } from "rollup";
import { expect } from "vitest";
import { buildHTML } from "../index";
import { FileCollection } from "magic-sandbox";
import { VizCache } from "../v3/vizCache";
import { VizId } from "@vizhub/viz-types";
import { SlugCache } from "../v3/slugCache";
import { SvelteCompiler } from "../v3/transformSvelte";

const DEBUG = false;

export async function testInBrowser({
  browser,
  files,
  vizCache,
  slugCache,
  vizId,
  expectedLog,
  getSvelteCompiler,
}: {
  browser: Browser;
  files?: FileCollection;
  vizCache?: VizCache;
  slugCache?: SlugCache;
  vizId?: VizId;
  expectedLog: string | RegExp;
  getSvelteCompiler?: () => Promise<SvelteCompiler>;
}) {
  const page: Page = await browser.newPage();
  try {
    // Capture console.log output
    const logs: string[] = [];
    page.on("console", (message) =>
      logs.push(message.text()),
    );

    // Capture page errors
    page.on("pageerror", (error) => {
      console.error("[testInBrowser] pageerror:", error);
    });

    // Load the HTML
    const html = await buildHTML({
      files,
      vizCache,
      slugCache,
      vizId,
      rollup,
      getSvelteCompiler,
    });
    await page.setContent(html);

    // Wait a bit for scripts to execute
    await new Promise((resolve) =>
      setTimeout(resolve, 100),
    );

    DEBUG && console.log("[testInBrowser] html:", html);
    DEBUG && console.log("[testInBrowser] logs:", logs);

    // Check console output
    if (typeof expectedLog === "string") {
      expect(logs).toContain(expectedLog);
    } else {
      // If it's a RegExp, find a log that matches
      const matchingLog = logs.find((log) =>
        expectedLog.test(log),
      );
      expect(matchingLog).toBeDefined();
    }
  } finally {
    await page.close();
  }
}
