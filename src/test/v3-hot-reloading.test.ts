import puppeteer, { Browser } from "puppeteer";
import {
  describe,
  it,
  beforeAll,
  afterAll,
  vi,
  expect,
} from "vitest";
import { testRuntimeWithWorker } from "./testRuntimeWithWorker";

let browser: Browser | null = null;

beforeAll(async () => {
  // Assume the server is already running at http://localhost:5173/
  browser = await puppeteer.launch();
});

afterAll(async () => {
  // Safely close browser
  if (browser) {
    await browser.close();
  }
});

describe("VizHub Runtime v3 Hot Reloading", () => {
  it("should have runtime available", async () => {
    if (!browser) {
      throw new Error("Browser is not initialized");
    }

    const page = await browser.newPage();

    try {
      // Requires the demo-app to be running
      // You need to run: `cd demo-app; npm run dev`
      await page.goto("http://localhost:3001");

      // Wait for runtime to be defined (up to 5 seconds)
      await page.waitForFunction(
        () => typeof window.runtime !== "undefined",
        { timeout: 5000 },
      );

      // Check if runtime is defined
      const runtimeDefined = await page.evaluate(() => {
        return typeof window.runtime !== "undefined";
      });

      expect(runtimeDefined).toBe(true);
    } finally {
      await page.close();
    }
  });

  it("should handle basic code changes", async () => {
    await testRuntimeWithWorker({
      browser,
      initialFiles: {
        "index.js": `
          export const main = () => {
            console.log("Initial version");
          }
          main();
        `,
      },
      expectedLog: "Initial version",
      codeChanges: [
        {
          files: {
            "index.js": `
              export const main = () => {
                console.log("First update");
              }
              main();
            `,
          },
          expectedLog: "First update",
        },
        {
          files: {
            "index.js": `
              export const main = () => {
                console.log("Second update");
              }
              main();
            `,
          },
          expectedLog: "Second update",
        },
      ],
    });
  });

  // it.skip("should handle multiple file changes", async () => {
  //   await testRuntimeWithWorker({
  //     browser,
  //     initialFiles: {
  //       "index.js": `
  //         import { message } from './message.js';
  //         console.log(message);
  //       `,
  //       "message.js": `
  //         export const message = "Initial message";
  //       `,
  //     },
  //     codeChanges: [
  //       {
  //         files: {
  //           "message.js": `
  //             export const message = "Updated message";
  //           `,
  //         },
  //         expectedLog: "Updated message",
  //       },
  //     ],
  //   });
  // });

  // it.skip("should handle syntax errors gracefully", async () => {
  //   await testRuntimeWithWorker({
  //     browser,
  //     initialFiles: {
  //       "index.js": `
  //         console.log("Starting");
  //       `,
  //     },
  //     codeChanges: [
  //       {
  //         files: {
  //           "index.js": `
  //             console.log("Before error");
  //             const x = {;
  //           `,
  //         },
  //         expectedLog: "Build Error: Unexpected token",
  //       },
  //       {
  //         files: {
  //           "index.js": `
  //             console.log("Recovery");
  //           `,
  //         },
  //         expectedLog: "Recovery",
  //       },
  //     ],
  //   });
  // });
});
