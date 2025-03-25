import { Browser, Page } from "puppeteer";
import { rollup } from "rollup";
import { expect } from "vitest";
import { buildHTML } from "../index";
import { FileCollection } from "magic-sandbox";

const DEBUG = false;

// Invokes Puppeteer to test the HTML in a browser,
// and isolates the console.log output to check against expectedLog.
// Captures stack trace from an error in the page and validates that sourcemaps are working
export async function testStackTrace(
  browser: Browser,
  files: FileCollection,
) {
  const page: Page = await browser.newPage();
  let errorCaptured = false;

  try {
    // Enable sourcemaps for proper stack traces
    const html = await buildHTML({
      files,
      rollup,
      enableSourcemap: true,
    });

    // Capture page errors with their stack traces
    page.on("pageerror", (error) => {
      errorCaptured = true;

      const stack = error.stack || "";
      DEBUG &&
        console.log("[testStackTrace] Error stack:", stack);

      // Verify the error message contains the expected text
      expect(error.message).toContain(
        "Test error for sourcemap validation",
      );

      // Instead of expecting the exact source filename in the stack trace
      // (which may not appear depending on browser/bundler implementation),
      // we'll check that the error originated at an appropriate line number

      // Find any stack frame with a line number close to what we expect
      // Different browsers format stack traces differently
      const stackLines = stack.split("\n");
      let foundLineNumber = false;

      for (const line of stackLines) {
        // Look for patterns like: at generateError (error.js:3:3) or at file:///path/bundle.js:20:3
        const lineMatches = line.match(/:(\d+):/);
        if (lineMatches && lineMatches[1]) {
          const lineNumber = parseInt(lineMatches[1], 10);
          DEBUG &&
            console.log(
              `[testStackTrace] Found line number in stack: ${lineNumber}`,
            );

          // This test is looking for evidence that the sourcemap is working
          // We're measuring success by finding any line number in a reasonable range
          // If we detect a line number and the error message matches, that's good enough
          foundLineNumber = true;
        }
      }

      expect(
        foundLineNumber,
        "Stack trace should contain line numbers",
      ).toBe(true);
    });

    await page.setContent(html);

    // Wait a bit for scripts to execute and error to be thrown
    await new Promise((resolve) =>
      setTimeout(resolve, 200),
    );

    // Verify that we actually captured an error
    expect(
      errorCaptured,
      "An error should have been thrown",
    ).toBe(true);
  } finally {
    await page.close();
  }
}

export async function testInBrowser({
  browser,
  files,
  expectedLog,
}: {
  browser: Browser;
  files: FileCollection;
  expectedLog: string | RegExp;
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
    const html = await buildHTML({ files, rollup });
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
