import { describe, expect, test } from "vitest";
import {
  formatRuntimeError,
  getRuntimeErrorHandlerScript,
} from "../common/runtimeErrorHandling";

describe("Runtime Error Handling", () => {
  describe("formatRuntimeError", () => {
    test("should format regular Error objects", () => {
      const error = new Error("Test error message");
      error.name = "TestError";
      error.stack =
        "TestError: Test error message\n    at test.js:1:1";

      const result = formatRuntimeError(error);
      expect(result).toContain(
        "TestError: Test error message",
      );
      expect(result).toContain("at test.js:1:1");
    });

    test("should format ErrorEvent objects", () => {
      const errorEvent = {
        error: new Error("Script error"),
        filename: "script.js",
        lineno: 10,
        colno: 5,
      } as any;

      const result = formatRuntimeError(errorEvent);
      expect(result).toContain("Error: Script error");
      expect(result).toContain("at script.js:10:5");
    });

    test("should format PromiseRejectionEvent with Error reason", () => {
      const rejectionEvent = {
        reason: new Error("Promise rejection error"),
      } as any;

      const result = formatRuntimeError(rejectionEvent);
      expect(result).toContain(
        "Unhandled Promise Rejection - Error: Promise rejection error",
      );
    });

    test("should format PromiseRejectionEvent with string reason", () => {
      const rejectionEvent = {
        reason: "String rejection reason",
      } as any;

      const result = formatRuntimeError(rejectionEvent);
      expect(result).toBe(
        "Unhandled Promise Rejection: String rejection reason",
      );
    });

    test("should handle unknown error types", () => {
      const unknownError = { someProperty: "value" } as any;

      const result = formatRuntimeError(unknownError);
      expect(result).toContain("Unknown runtime error:");
      expect(result).toContain("[object Object]");
    });
  });

  describe("getRuntimeErrorHandlerScript", () => {
    test("should return valid JavaScript code", () => {
      const script = getRuntimeErrorHandlerScript();

      // Should contain the error handler setup
      expect(script).toContain(
        "window.addEventListener('error'",
      );
      expect(script).toContain(
        "window.addEventListener('unhandledrejection'",
      );
      expect(script).toContain("parent.postMessage");
      expect(script).toContain("type: 'runtimeError'");
      expect(script).toContain("formattedErrorMessage");

      // Should be valid JavaScript (no syntax errors when executed in eval)
      expect(() => {
        // Wrap in function to avoid actually adding event listeners
        const wrappedScript = `(function() { ${script} })`;
        new Function(wrappedScript);
      }).not.toThrow();
    });
  });
});
