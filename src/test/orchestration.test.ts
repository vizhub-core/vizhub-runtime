import { describe, it, expect, vi } from "vitest";
import { testMockedIframeWithWorker } from "./testMockedIframeWithWorker";
import { createRuntime } from "../orchestration/createRuntime";
import { BuildWorkerMessage } from "../orchestration/types";

// Mock Worker since it's not available in Node.js environment
class MockWorker {
  constructor(public url: string) {}
  addEventListener() {}
  removeEventListener() {}
  postMessage() {}
}

// Set up global Worker
global.Worker = MockWorker as any;

// Mock window since it's not available in Node.js environment
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  postMessage: vi.fn(),
};

// Set up global window
global.window = mockWindow as any;

describe("Iframe and Worker Management", () => {
  it("should send file collection to worker when code changes", async () => {
    await testMockedIframeWithWorker({
      vizContent: {
        id: "test-viz-id",
        title: "Test Viz",
        files: {
          "index.js": {
            name: "index.js",
            text: "console.log('Hello from test');",
          },
        },
      },
    });
  });

  it("should update iframe srcdoc when worker responds with HTML", async () => {
    await testMockedIframeWithWorker({
      vizContent: {
        id: "test-viz-id",
        title: "Test Viz",
        files: {
          "index.js": {
            name: "index.js",
            text: "console.log('Hello from test');",
          },
        },
      },
      expectedHtmlUpdate: true,
      customAssertions: ({ iframe }) => {
        expect(iframe.srcdoc).toContain(
          "Worker processed files",
        );
      },
    });
  });

  it("should handle build errors from worker", async () => {
    // Create a mock worker that will simulate an error response
    class ErrorWorker {
      private listeners: {
        [key: string]: ((event: any) => void)[];
      } = {};

      constructor(public url: string) {}

      postMessage(message: any) {
        if (message.type === "buildRequest") {
          setTimeout(() => {
            const listeners =
              this.listeners["message"] || [];
            const data: BuildWorkerMessage = {
              type: "buildResponse",
              error: "Test build error",
              requestId: message.requestId,
            };
            listeners.forEach((callback) =>
              callback({
                data,
              }),
            );
          }, 10);
        }
      }

      addEventListener(type: string, callback: any) {
        if (!this.listeners[type]) {
          this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
      }

      removeEventListener(type: string, callback: any) {
        if (this.listeners[type]) {
          this.listeners[type] = this.listeners[
            type
          ].filter((cb) => cb !== callback);
        }
      }
    }

    // Save original Worker
    const originalWorker = global.Worker;
    // Replace with our error worker
    global.Worker = ErrorWorker as any;

    try {
      let errorMessage: string | null = null;
      const iframe = { srcdoc: "" } as HTMLIFrameElement;
      const setBuildErrorMessage = (
        error: string | null,
      ) => {
        errorMessage = error;
      };

      const worker = new Worker("test-worker-url");

      const runtime = createRuntime({
        iframe,
        setBuildErrorMessage,
        worker,
      });

      runtime.run({
        files: {
          "index.js": "console.log('Hello from test');",
        },
      });

      // Wait for async operations
      await new Promise((resolve) =>
        setTimeout(resolve, 50),
      );

      expect(errorMessage).toBe("Test build error");
      expect(iframe.srcdoc).toBe(""); // Should not update iframe on error

      runtime.cleanup();
    } finally {
      // Restore the original Worker
      global.Worker = originalWorker;
    }
  });

  it("should clean up event listeners when cleanup is called", async () => {
    const removeEventListenerSpy = vi.fn();

    class SpyWorker {
      constructor(public url: string) {}

      addEventListener() {}
      removeEventListener = removeEventListenerSpy;
      postMessage() {}
    }

    const originalWorker = global.Worker;
    global.Worker = SpyWorker as any;

    try {
      const iframe = { srcdoc: "" } as HTMLIFrameElement;
      const setBuildErrorMessage = vi.fn();
      const worker = new Worker("test-worker-url");

      const runtime = createRuntime({
        iframe,
        setBuildErrorMessage,
        worker,
      });

      runtime.cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalled();
    } finally {
      global.Worker = originalWorker;
    }
  });

  it("should clear console by default when clearConsole is not specified", async () => {
    const consoleClearSpy = vi
      .spyOn(console, "clear")
      .mockImplementation(() => {});

    // Create a mock worker that will simulate a successful build response
    class MockBuildWorker {
      private listeners: {
        [key: string]: ((event: any) => void)[];
      } = {};

      constructor(public url: string) {}

      postMessage(message: any) {
        if (message.type === "buildRequest") {
          setTimeout(() => {
            const listeners =
              this.listeners["message"] || [];
            const data: BuildWorkerMessage = {
              type: "buildResponse",
              requestId: message.requestId,
              buildResult: {
                html: "<html>Test HTML</html>",
                runtimeVersion: "v2" as any,
                js: "console.log('test');",
                css: "body { color: red; }",
              },
            };
            listeners.forEach((callback) =>
              callback({ data }),
            );
          }, 10);
        }
      }

      addEventListener(type: string, callback: any) {
        if (!this.listeners[type]) {
          this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
      }

      removeEventListener(type: string, callback: any) {
        if (this.listeners[type]) {
          this.listeners[type] = this.listeners[
            type
          ].filter((cb) => cb !== callback);
        }
      }
    }

    const originalWorker = global.Worker;
    global.Worker = MockBuildWorker as any;

    try {
      const iframe = { srcdoc: "" } as HTMLIFrameElement;
      const setBuildErrorMessage = vi.fn();
      const worker = new Worker("test-worker-url");

      const runtime = createRuntime({
        iframe,
        setBuildErrorMessage,
        worker,
      });

      // Run without specifying clearConsole (should default to true)
      runtime.run({
        files: {
          "index.js": "console.log('Hello from test');",
        },
      });

      // Wait for async operations
      await new Promise((resolve) =>
        setTimeout(resolve, 50),
      );

      expect(consoleClearSpy).toHaveBeenCalled();

      runtime.cleanup();
    } finally {
      global.Worker = originalWorker;
      consoleClearSpy.mockRestore();
    }
  });

  it("should not clear console when clearConsole is set to false", async () => {
    const consoleClearSpy = vi
      .spyOn(console, "clear")
      .mockImplementation(() => {});

    // Create a mock worker that will simulate a successful build response
    class MockBuildWorker {
      private listeners: {
        [key: string]: ((event: any) => void)[];
      } = {};

      constructor(public url: string) {}

      postMessage(message: any) {
        if (message.type === "buildRequest") {
          setTimeout(() => {
            const listeners =
              this.listeners["message"] || [];
            const data: BuildWorkerMessage = {
              type: "buildResponse",
              requestId: message.requestId,
              buildResult: {
                html: "<html>Test HTML</html>",
                runtimeVersion: "v2" as any,
                js: "console.log('test');",
                css: "body { color: red; }",
              },
            };
            listeners.forEach((callback) =>
              callback({ data }),
            );
          }, 10);
        }
      }

      addEventListener(type: string, callback: any) {
        if (!this.listeners[type]) {
          this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
      }

      removeEventListener(type: string, callback: any) {
        if (this.listeners[type]) {
          this.listeners[type] = this.listeners[
            type
          ].filter((cb) => cb !== callback);
        }
      }
    }

    const originalWorker = global.Worker;
    global.Worker = MockBuildWorker as any;

    try {
      const iframe = { srcdoc: "" } as HTMLIFrameElement;
      const setBuildErrorMessage = vi.fn();
      const worker = new Worker("test-worker-url");

      const runtime = createRuntime({
        iframe,
        setBuildErrorMessage,
        worker,
      });

      // Run with clearConsole set to false
      runtime.run({
        files: {
          "index.js": "console.log('Hello from test');",
        },
        clearConsole: false,
      });

      // Wait for async operations
      await new Promise((resolve) =>
        setTimeout(resolve, 50),
      );

      expect(consoleClearSpy).not.toHaveBeenCalled();

      runtime.cleanup();
    } finally {
      global.Worker = originalWorker;
      consoleClearSpy.mockRestore();
    }
  });

  it("should clear console when clearConsole is explicitly set to true", async () => {
    const consoleClearSpy = vi
      .spyOn(console, "clear")
      .mockImplementation(() => {});

    // Create a mock worker that will simulate a successful build response
    class MockBuildWorker {
      private listeners: {
        [key: string]: ((event: any) => void)[];
      } = {};

      constructor(public url: string) {}

      postMessage(message: any) {
        if (message.type === "buildRequest") {
          setTimeout(() => {
            const listeners =
              this.listeners["message"] || [];
            const data: BuildWorkerMessage = {
              type: "buildResponse",
              requestId: message.requestId,
              buildResult: {
                html: "<html>Test HTML</html>",
                runtimeVersion: "v2" as any,
                js: "console.log('test');",
                css: "body { color: red; }",
              },
            };
            listeners.forEach((callback) =>
              callback({ data }),
            );
          }, 10);
        }
      }

      addEventListener(type: string, callback: any) {
        if (!this.listeners[type]) {
          this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
      }

      removeEventListener(type: string, callback: any) {
        if (this.listeners[type]) {
          this.listeners[type] = this.listeners[
            type
          ].filter((cb) => cb !== callback);
        }
      }
    }

    const originalWorker = global.Worker;
    global.Worker = MockBuildWorker as any;

    try {
      const iframe = { srcdoc: "" } as HTMLIFrameElement;
      const setBuildErrorMessage = vi.fn();
      const worker = new Worker("test-worker-url");

      const runtime = createRuntime({
        iframe,
        setBuildErrorMessage,
        worker,
      });

      // Run with clearConsole explicitly set to true
      runtime.run({
        files: {
          "index.js": "console.log('Hello from test');",
        },
        clearConsole: true,
      });

      // Wait for async operations
      await new Promise((resolve) =>
        setTimeout(resolve, 50),
      );

      expect(consoleClearSpy).toHaveBeenCalled();

      runtime.cleanup();
    } finally {
      global.Worker = originalWorker;
      consoleClearSpy.mockRestore();
    }
  });
});
