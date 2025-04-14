import { describe, it, expect } from "vitest";
import { cleanRollupErrorMessage } from "./cleanRollupErrorMessage";

describe("cleanRollupErrorMessage", () => {
  it("should replace vizId with a dot in error message", () => {
    const vizId = "7f0b69fcb754479699172d1887817027";
    const rawMessage =
      "7f0b69fcb754479699172d1887817027/index.js (14:8): Expected ';', '}' or <eof>";

    const result = cleanRollupErrorMessage({
      rawMessage,
      vizId,
    });

    expect(result).toBe(
      "./index.js (14:8): Expected ';', '}' or <eof>",
    );
  });

  it("should handle multiple occurrences of vizId", () => {
    const vizId = "abc123";
    const rawMessage =
      "abc123/index.js imports abc123/utils.js";

    const result = cleanRollupErrorMessage({
      rawMessage,
      vizId,
    });

    expect(result).toBe("./index.js imports ./utils.js");
  });

  it("should handle message without vizId", () => {
    const vizId = "abc123";
    const rawMessage = "regular error message";

    const result = cleanRollupErrorMessage({
      rawMessage,
      vizId,
    });

    expect(result).toBe("regular error message");
  });

  it("should handle undefined message gracefully", () => {
    const vizId = "abc123";
    const rawMessage = undefined as unknown as string;

    const result = cleanRollupErrorMessage({
      rawMessage,
      vizId,
    });

    expect(result).toBe(undefined);
  });
});
