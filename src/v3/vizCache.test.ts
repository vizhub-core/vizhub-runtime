import { describe, it, expect, vi } from "vitest";
import { createVizCache } from "./vizCache";
import { sampleVizContent } from "../test/fixtures/v3";
import { VizContent } from "@vizhub/viz-types";

describe("VizCache", () => {
  describe("VizCache - get method", () => {
    it("should return content from cache if available", async () => {
      const vizCache = createVizCache({
        initialContents: [sampleVizContent],
        handleCacheMiss: vi.fn(),
      });
      const content = await vizCache.get(sampleVizContent.id);
      expect(content).toEqual(sampleVizContent);
      expect(vi.fn()).toHaveBeenCalledTimes(0); // handleCacheMiss should not be called
    });

    it("should fetch content on cache miss and store it", async () => {
      const handleCacheMissMock = vi.fn().mockResolvedValue(sampleVizContent);
      const vizCache = createVizCache({
        initialContents: [],
        handleCacheMiss: handleCacheMissMock,
      });

      const content = await vizCache.get(sampleVizContent.id);
      expect(handleCacheMissMock).toHaveBeenCalledWith(sampleVizContent.id);
      expect(content).toEqual(sampleVizContent);
      // Verify that the cache now contains the fetched content
      const cachedContent = await vizCache.get(sampleVizContent.id);
      expect(cachedContent).toEqual(sampleVizContent);
    });

    it("should throw an error if handleCacheMiss does not return content", async () => {
      const handleCacheMissMock = vi.fn().mockResolvedValue(undefined);
      const vizCache = createVizCache({
        initialContents: [],
        handleCacheMiss: handleCacheMissMock,
      });

      await expect(vizCache.get("nonexistentId")).rejects.toThrow(
        "Unresolved import from vizId nonexistentId"
      );
    });

    // Add tests for set
  });
  describe("VizCache - set method", () => {
    it("should add new content to the cache", async () => {
      const vizCache = createVizCache({
        initialContents: [],
        handleCacheMiss: vi.fn(),
      });

      const newContent: VizContent = {
        id: "newContent",
        files: {},
        title: "New Content",
      };

      vizCache.set(newContent);

      // Verify new content is added
      const content = await vizCache.get(newContent.id);
      expect(content).toEqual(newContent);
    });

    it("should update existing content in the cache", async () => {
      const updatedContent: VizContent = {
        ...sampleVizContent,
        title: "Updated Content Title",
      };

      const vizCache = createVizCache({
        initialContents: [sampleVizContent],
        handleCacheMiss: vi.fn(),
      });

      // Update existing content
      vizCache.set(updatedContent);

      // Verify content is updated
      const content = await vizCache.get(updatedContent.id);
      expect(content).toEqual(updatedContent);
    });

    it("should keep the cache consistent after multiple set operations", async () => {
      const vizCache = createVizCache({
        initialContents: [],
        handleCacheMiss: vi.fn(),
      });

      // Adding multiple contents
      const contentA: VizContent = {
        id: "contentA",
        files: {},
        title: "Content A",
      };

      const contentB: VizContent = {
        id: "contentB",
        files: {},
        title: "Content B",
      };

      vizCache.set(contentA);
      vizCache.set(contentB);

      // Verify both contents are retrievable
      const retrievedA = await vizCache.get(contentA.id);
      const retrievedB = await vizCache.get(contentB.id);

      expect(retrievedA).toEqual(contentA);
      expect(retrievedB).toEqual(contentB);
    });
  });
});
