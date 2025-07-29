import { describe, expect, test, vi, beforeEach } from "vitest";
import { createRuntime } from "../orchestration/createRuntime";

// Mock window object
Object.defineProperty(global, 'window', {
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    location: {
      origin: 'http://localhost'
    }
  },
  writable: true
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Runtime Error Handling Integration", () => {
  test("should call handleRuntimeError when runtimeError message is received", () => {
    // Mock iframe and worker
    const mockIframe = {} as HTMLIFrameElement;
    const mockWorker = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
    } as any;

    // Mock handleRuntimeError callback
    const handleRuntimeError = vi.fn();

    // Create runtime with the callback
    const runtime = createRuntime({
      iframe: mockIframe,
      worker: mockWorker,
      handleRuntimeError,
    });

    // Get the window event listener that was added
    const windowEventListenerCalls = vi.mocked(window.addEventListener);
    expect(windowEventListenerCalls).toHaveBeenCalledWith("message", expect.any(Function));
    
    // Get the listener function
    const messageListener = windowEventListenerCalls.mock.calls.find(
      call => call[0] === "message"
    )?.[1] as EventListener;

    expect(messageListener).toBeDefined();

    // Simulate a runtimeError message from the iframe
    const mockEvent = {
      data: {
        type: "runtimeError",
        formattedErrorMessage: "Test runtime error message",
      },
    } as MessageEvent;

    messageListener(mockEvent);

    // Verify that handleRuntimeError was called with the correct message
    expect(handleRuntimeError).toHaveBeenCalledWith("Test runtime error message");
    expect(handleRuntimeError).toHaveBeenCalledTimes(1);

    // Clean up
    runtime.cleanup();
  });

  test("should not call handleRuntimeError when callback is not provided", () => {
    // Mock iframe and worker
    const mockIframe = {} as HTMLIFrameElement;
    const mockWorker = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
    } as any;

    // Create runtime WITHOUT the callback
    const runtime = createRuntime({
      iframe: mockIframe,
      worker: mockWorker,
    });

    // Get the window event listener that was added
    const windowEventListenerCalls = vi.mocked(window.addEventListener);
    const messageListener = windowEventListenerCalls.mock.calls.find(
      call => call[0] === "message"
    )?.[1] as EventListener;

    expect(messageListener).toBeDefined();

    // Simulate a runtimeError message from the iframe
    const mockEvent = {
      data: {
        type: "runtimeError",
        formattedErrorMessage: "Test runtime error message",
      },
    } as MessageEvent;

    // This should not throw an error even though no callback is provided
    expect(() => messageListener(mockEvent)).not.toThrow();

    // Clean up
    runtime.cleanup();
  });

  test("should handle other message types without calling handleRuntimeError", () => {
    // Mock iframe and worker
    const mockIframe = {} as HTMLIFrameElement;
    const mockWorker = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
    } as any;

    // Mock handleRuntimeError callback
    const handleRuntimeError = vi.fn();

    // Create runtime with the callback
    const runtime = createRuntime({
      iframe: mockIframe,
      worker: mockWorker,
      handleRuntimeError,
    });

    // Get the window event listener that was added
    const windowEventListenerCalls = vi.mocked(window.addEventListener);
    const messageListener = windowEventListenerCalls.mock.calls.find(
      call => call[0] === "message"
    )?.[1] as EventListener;

    expect(messageListener).toBeDefined();

    // Simulate other message types
    const writeFileMessage = {
      data: {
        type: "writeFile",
        fileName: "test.txt",
        content: "test content",
      },
    } as MessageEvent;

    const runDoneMessage = {
      data: {
        type: "runDone",
        requestId: "test-id",
      },
    } as MessageEvent;

    messageListener(writeFileMessage);
    messageListener(runDoneMessage);

    // Verify that handleRuntimeError was NOT called
    expect(handleRuntimeError).not.toHaveBeenCalled();

    // Clean up
    runtime.cleanup();
  });
});