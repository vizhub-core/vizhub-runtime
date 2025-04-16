// TODO Puppeteer-based tests that invoke
// `src/createRuntime.ts`, where `worker` is a Web Worker
// from `src/worker.ts`.
import { expect } from "vitest";
import { VizContent } from "@vizhub/viz-types";
import { createRuntime } from "../orchestration/createRuntime";
import { vizFilesToFileCollection } from "@vizhub/viz-utils";
import { BuildWorkerMessage } from "../types";

// Mock implementation of Worker for testing
class MockWorker {
  private listeners: {
    [key: string]: ((event: any) => void)[];
  } = {};

  constructor(public url: string) {}

  addEventListener(
    type: string,
    callback: (event: any) => void,
  ) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  removeEventListener(
    type: string,
    callback: (event: any) => void,
  ) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(
        (cb) => cb !== callback,
      );
    }
  }

  postMessage(message: BuildWorkerMessage) {
    // Store the last message for inspection
    this.lastMessage = message;

    // If this is a build request, simulate a response
    if (message.type === "buildRequest") {
      setTimeout(() => {
        this.dispatchEvent({
          data: {
            type: "buildResponse",
            html: `<!DOCTYPE html><html><body><script>console.log("Worker processed files")</script></body></html>`,
          },
        });
      }, 10);
    }
  }

  dispatchEvent(event: any) {
    const listeners = this.listeners["message"] || [];
    listeners.forEach((callback) => callback(event));
  }

  // For test inspection
  lastMessage: any = null;
}

// Mock implementation of iframe for testing
class MockIframe {
  srcdoc: string = "";
}

export async function testMockedIframeWithWorker({
  vizContent,
  expectedHtmlUpdate = true,
  expectError = false,
  customAssertions,
}: {
  vizContent: VizContent;
  expectedHtmlUpdate?: boolean;
  expectError?: boolean;
  customAssertions?: (params: {
    worker: MockWorker;
    iframe: MockIframe;
    runtime: any;
    errorMessage: string | null;
  }) => void;
}) {
  // Create mocks
  const iframe = new MockIframe();
  let errorMessage: string | null = null;
  const setBuildErrorMessage = (error: string | null) => {
    errorMessage = error;
  };

  // Create a mock worker
  const worker = new MockWorker(
    "test-worker-url",
  ) as unknown as Worker;

  // Create the runtime with our mocks
  const runtime = createRuntime({
    iframe: iframe as unknown as HTMLIFrameElement,
    setBuildErrorMessage,
    worker,
  });

  // Trigger a code change
  runtime.run({
    files: vizFilesToFileCollection(vizContent.files),
  });

  // Wait for async operations
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Verify the worker received the correct message
  const mockWorker = worker as unknown as MockWorker;
  expect(mockWorker.lastMessage).not.toBeNull();
  expect(mockWorker.lastMessage.type).toBe("buildRequest");
  console.log(
    "mockWorker.lastMessage ",
    mockWorker.lastMessage,
  );
  expect(mockWorker.lastMessage.files).toEqual(
    vizFilesToFileCollection(vizContent.files),
  );

  // Verify iframe was updated if expected
  if (expectedHtmlUpdate) {
    expect(iframe.srcdoc).not.toBe("");
  }

  // Verify error handling
  if (expectError) {
    expect(errorMessage).not.toBeNull();
  } else {
    expect(errorMessage).toBeNull();
  }

  // Run any custom assertions
  if (customAssertions) {
    customAssertions({
      worker: mockWorker,
      iframe,
      runtime,
      errorMessage,
    });
  }

  // Clean up
  runtime.cleanup();
}
