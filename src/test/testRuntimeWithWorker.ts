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
  codeChanges?: Array<{
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
    // Requires the demo-app to be running
    // Entry point for this app is `demo-app/src/main.ts`.
    await page.goto("http://localhost:3001");

    // Wait for runtime to be ready
    await page.waitForFunction(() => window.runtime);

    // Capture console output
    const logs: string[] = [];
    page.on("console", (message) => {
      logs.push(message.text());
    });

    // Initial code load
    await page.evaluate((files) => {
      window.runtime.reload(files, {
        hot: true,
      });
    }, initialFiles);

    // Helper function for exponential backoff
    const waitForLog = async (expectedLog: string) => {
      let attempts = 0;
      const maxAttempts = 10;
      const initialDelay = 50; // ms

      while (attempts < maxAttempts) {
        if (logs.includes(expectedLog)) {
          break;
        }

        const delay = initialDelay * Math.pow(2, attempts);
        // console.log("polling for logs with delay", delay);
        await new Promise((resolve) =>
          setTimeout(resolve, delay),
        );
        attempts++;
      }

      expect(logs).toContain(expectedLog);
    };

    await waitForLog(expectedLog);

    // Apply each code change and verify
    if (codeChanges) {
      for (const change of codeChanges) {
        logs.length = 0;

        await page.evaluate((files) => {
          window.runtime.reload(files);
        }, change.files);

        // Wait for update using exponential backoff
        await waitForLog(change.expectedLog);
      }
    }
  } finally {
    await page.close();
  }
}
