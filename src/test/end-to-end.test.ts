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

describe("VizHub Runtime End to End (Web Worker, iframe)", () => {
  it("should be running `npm run test:demo-app` (start this manually in another terminal if this fails)", async () => {
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
            `,
          },
          expectedLog: "Second update",
        },
      ],
    });
  });

  // TODO support the hot reloading case
  // This test is currently failing - we need to make it pass.
  it("should hot reload with v3 runtime", async () => {
    await testRuntimeWithWorker({
      browser,
      initialFiles: {
        "index.js": `
          export const main = (container, {state, setState}) => {
            if(!state.count) {
              setState(state => ({...state, count: 5}));
              return;
            }
            console.log("state.count = " + state.count);
          }
        `,
      },
      expectedLog: "state.count = 5",
      codeChanges: [
        {
          files: {
            "index.js": `
              export const main = (container, {state, setState}) => {
                console.log("state.count = " + state.count);
              }
            `,
          },
          // We expect the log to be "state.count = 5" because
          // the state is already set in the first run,
          // and if it does hot reloading properly,
          // the state should be preserved.
          expectedLog: "state.count = 5",
        },
      ],
    });
  });
});
