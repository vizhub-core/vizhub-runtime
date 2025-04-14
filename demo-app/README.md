# VizHub Runtime Demo App

This is a Vite demo app that imports the VizHub Runtime and exposes it for Puppeteer to use for testing. It serves as a test harness for end-to-end testing of the VizHub Runtime in a real browser environment.

## How the Testing Works

### Overview

The current testing approach injects HTML directly into a Puppeteer page, but the ideal approach is to use this demo app as a proper test environment. Here's how the testing should work:

1. The demo app gets served locally with `npm run dev`
2. The test script uses `puppeteer` to open a browser and navigate to the demo app
3. The demo app exposes the VizHub Runtime to the global scope
4. The test script can then use the VizHub Runtime to run tests based on fixtures
5. This allows full end-to-end testing of the VizHub Runtime in a real browser environment

### Benefits of This Approach

- Tests the runtime in a real browser environment with proper module loading
- Tests the Web Worker that does the build in its actual context
- Tests the iframe that runs the built code
- Provides a more realistic testing environment than injecting HTML
- Allows for testing hot reloading and other dynamic behaviors

### Implementation Details

The test runner should:

1. Start the Vite dev server in a child process using `cd demo-app; npm run dev`
2. Use Puppeteer to navigate to the locally served demo app
3. Wait for the runtime to be available on the global scope
4. Execute test cases by calling methods on the runtime
5. Verify the expected behavior through console logs or other observable effects

### Example Test Implementation

```typescript
export async function testRuntimeWithWorker({
  browser,
  initialFiles,
  codeChanges,
}: {
  browser: Browser;
  initialFiles: FileCollection;
  codeChanges: Array<{
    files: FileCollection;
    expectedLog: string;
  }>;
}) {
  const page = await browser.newPage();

  try {
    // Load the pre-built demo app instead of injecting HTML
    await page.goto("http://localhost:5173"); // Or whatever port Vite serves it on

    // Wait for runtime to be ready
    await page.waitForFunction(() => window.runtime);

    // Capture console output
    const logs: string[] = [];
    page.on("console", (message) =>
      logs.push(message.text()),
    );

    // Initial code load
    await page.evaluate((files) => {
      window.runtime.reload(files);
    }, initialFiles);

    // Wait for initial render
    await new Promise((resolve) =>
      setTimeout(resolve, 100),
    );

    // Apply each code change and verify
    for (const change of codeChanges) {
      logs.length = 0;

      await page.evaluate((files) => {
        window.runtime.reload(files);
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
```

## Setting Up the Demo App

The demo app needs to:

1. Import the VizHub Runtime
2. Create a Web Worker using the worker code
3. Set up an iframe for the runtime to use
4. Create a runtime instance and expose it to the global scope
5. Provide a UI for manual testing (optional)

## Running Tests

To run the tests:

1. Start the demo app: `cd demo-app && npm run dev`
2. In another terminal, run the tests: `npm test`

This approach ensures that the VizHub Runtime is tested in a realistic environment, with all its components (Web Worker, iframe, etc.) functioning as they would in production.
