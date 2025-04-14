import { Browser, Page } from "puppeteer";
import { expect } from "vitest";
import { FileCollection } from "@vizhub/viz-types";
import { VizHubRuntime } from "../types";

declare global {
  interface Window {
    runtime: VizHubRuntime;
  }
}

export async function testRuntimeWithWorker({
  browser,
  initialFiles,
  expectedLog,
  codeChanges,
}: {
  browser: Browser | null;
  initialFiles: FileCollection;
  expectedLog: string;
  codeChanges: Array<{
    files: FileCollection;
    expectedLog: string;
  }>;
}) {
  if (!browser) {
    throw new Error("Browser is not initialized");
  }
  const page = await browser.newPage();

  try {
    // Load the pre-built demo app instead of injecting HTML
    await page.goto("http://localhost:3001");

    // Wait for runtime to be ready
    await page.waitForFunction(() => window.runtime);

    // Capture console output
    const logs: string[] = [];
    page.on("console", (message) => {
      console.log("Console message:", message.text());
      logs.push(message.text());
    });

    // Initial code load
    await page.evaluate((files) => {
      window.runtime.reload(files);
    }, initialFiles);

    // Wait for initial render with exponential backoff
    let attempts = 0;
    const maxAttempts = 10;
    const initialDelay = 50; // ms

    while (attempts < maxAttempts) {
      if (logs.includes(expectedLog)) {
        break;
      }

      const delay = initialDelay * Math.pow(2, attempts);
      console.log("polling for logs with delay", delay);
      await new Promise((resolve) =>
        setTimeout(resolve, delay),
      );
      attempts++;
    }

    expect(logs).toContain(expectedLog);

    // Apply each code change and verify
    for (const change of codeChanges) {
      logs.length = 0;

      await page.evaluate((files) => {
        window.runtime.reload(files);
      }, change.files);

      // Wait for update
      // TODO use the same exponential backoff as above,
      // refactored to a common function
      await new Promise((resolve) =>
        setTimeout(resolve, 100),
      );

      expect(logs).toContain(change.expectedLog);
    }
  } finally {
    await page.close();
  }
}
