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

## Running Tests

To run the tests:

1. Start the demo app: `cd demo-app && npm run dev`
2. In another terminal, run the tests: `npm test`

This approach ensures that the VizHub Runtime is tested in a realistic environment, with all its components (Web Worker, iframe, etc.) functioning as they would in production.
