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
  codeChanges,
}: {
  browser: Browser | null;
  initialFiles: FileCollection;
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
    await page.goto("http://localhost:5173");

    // Wait for runtime to be ready
    await page.waitForFunction(() => window.runtime);

    // Capture console output
    const logs: string[] = [];
    page.on("console", (message) =>
      logs.push(message.text()),
    );

    // Initial code load
    await page.evaluate((files) => {
      window.runtime.handleCodeChange(files);
    }, initialFiles);

    // Wait for initial render
    await new Promise((resolve) =>
      setTimeout(resolve, 100),
    );

    // Apply each code change and verify
    for (const change of codeChanges) {
      logs.length = 0;

      await page.evaluate((files) => {
        window.runtime.handleCodeChange(files);
      }, change.files);

      // Wait for update
      await new Promise((resolve) =>
        setTimeout(resolve, 100),
      );

      expect(logs).toContain(change.expectedLog);
    }
  } finally {
    await page.close();
  }
}
