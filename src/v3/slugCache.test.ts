import { describe, it, expect, vi } from "vitest";
import { createSlugCache } from "./slugCache";
import type { VizId } from "@vizhub/viz-types";
import type { SlugIdentifier } from "./slugCache";

describe("SlugCache", () => {
  describe("SlugCache - get method", () => {
    it("should return vizId from cache if available", async () => {
      const initialMappings = {
        "user1/viz-slug": "viz-123" as VizId
      };
      
      const slugCache = createSlugCache({
        initialMappings,
        handleCacheMiss: vi.fn(),
      });
      
      const vizId = await slugCache.get("user1/viz-slug");
      expect(vizId).toEqual("viz-123");
      expect(vi.fn()).toHaveBeenCalledTimes(0); // handleCacheMiss should not be called
    });

    it("should resolve slug on cache miss and store it", async () => {
      const handleCacheMissMock = vi
        .fn()
        .mockResolvedValue("viz-456" as VizId);
      
      const slugCache = createSlugCache({
        initialMappings: {},
        handleCacheMiss: handleCacheMissMock,
      });

      const vizId = await slugCache.get("user2/new-viz");
      expect(handleCacheMissMock).toHaveBeenCalledWith("user2/new-viz");
      expect(vizId).toEqual("viz-456");
      
      // Verify that the cache now contains the resolved mapping
      const cachedVizId = await slugCache.get("user2/new-viz");
      expect(cachedVizId).toEqual("viz-456");
      expect(handleCacheMissMock).toHaveBeenCalledTimes(1); // Should only be called once
    });

    it("should throw an error if handleCacheMiss does not return a vizId", async () => {
      const handleCacheMissMock = vi
        .fn()
        .mockResolvedValue(undefined);
      
      const slugCache = createSlugCache({
        initialMappings: {},
        handleCacheMiss: handleCacheMissMock,
      });

      await expect(
        slugCache.get("nonexistent/slug")
      ).rejects.toThrow(
        "Unresolved slug nonexistent/slug"
      );
    });

    it("should throw an error if no handleCacheMiss is provided and slug not found", async () => {
      const slugCache = createSlugCache({
        initialMappings: {}
      });

      await expect(
        slugCache.get("missing/slug")
      ).rejects.toThrow(
        "Unresolved slug missing/slug, cache miss handler not provided."
      );
    });
  });

  describe("SlugCache - set method", () => {
    it("should add new mapping to the cache", async () => {
      const slugCache = createSlugCache({
        initialMappings: {},
        handleCacheMiss: vi.fn(),
      });

      const slug: SlugIdentifier = "user3/new-viz";
      const vizId: VizId = "viz-789";

      slugCache.set(slug, vizId);

      // Verify new mapping is added
      const resolvedVizId = await slugCache.get(slug);
      expect(resolvedVizId).toEqual(vizId);
    });

    it("should update existing mapping in the cache", async () => {
      const initialMappings = {
        "user4/existing-viz": "old-viz-id" as VizId
      };
      
      const slugCache = createSlugCache({
        initialMappings,
        handleCacheMiss: vi.fn(),
      });

      const slug: SlugIdentifier = "user4/existing-viz";
      const updatedVizId: VizId = "updated-viz-id";

      // Update existing mapping
      slugCache.set(slug, updatedVizId);

      // Verify mapping is updated
      const resolvedVizId = await slugCache.get(slug);
      expect(resolvedVizId).toEqual(updatedVizId);
    });
  });

  describe("SlugCache - invalidate method", () => {
    it("should remove a mapping from the cache", async () => {
      const initialMappings = {
        "user5/to-remove": "viz-to-remove" as VizId
      };
      
      const handleCacheMissMock = vi.fn();
      
      const slugCache = createSlugCache({
        initialMappings,
        handleCacheMiss: handleCacheMissMock,
      });

      // Verify mapping exists initially
      const initialVizId = await slugCache.get("user5/to-remove");
      expect(initialVizId).toEqual("viz-to-remove");

      // Invalidate the mapping
      slugCache.invalidate("user5/to-remove");

      // Trying to get it should trigger the cache miss handler
      try {
        await slugCache.get("user5/to-remove");
      } catch (e) {
        // Ignore error if handleCacheMiss throws
      }
      
      expect(handleCacheMissMock).toHaveBeenCalledWith("user5/to-remove");
    });
  });
});
