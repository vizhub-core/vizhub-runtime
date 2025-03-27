import { VizId } from "@vizhub/viz-types";

export type SlugIdentifier = `${string}/${string}`;

export type SlugCache = {
  get: (slug: SlugIdentifier) => Promise<VizId>;
  set: (slug: SlugIdentifier, vizId: VizId) => void;
  invalidate: (slug: SlugIdentifier) => void;
};

// A cache of viz IDs for slug resolution.
// Maps slug strings (username/slug) to viz IDs.
export const createSlugCache = ({
  initialMappings = {},
  handleCacheMiss,
}: {
  initialMappings?: Record<SlugIdentifier, VizId>;
  handleCacheMiss?: (
    slug: SlugIdentifier,
  ) => Promise<VizId>;
}): SlugCache => {
  // Track the mapping of slugs to viz IDs
  const slugMap = new Map<SlugIdentifier, VizId>(
    Object.entries(initialMappings) as [
      SlugIdentifier,
      VizId,
    ][],
  );

  // Gets the viz ID for a slug.
  // Returns the cached ID if it exists.
  // Otherwise, calls handleCacheMiss to resolve the slug.
  const get = async (
    slug: SlugIdentifier,
  ): Promise<VizId> => {
    const cachedVizId: VizId | undefined =
      slugMap.get(slug);

    // Cache hit
    if (cachedVizId !== undefined) {
      return cachedVizId;
    }

    // Cache miss
    if (!handleCacheMiss) {
      throw new Error(
        `Unresolved slug ${slug}, cache miss handler not provided.`,
      );
    }

    const resolvedVizId = await handleCacheMiss(slug);

    if (resolvedVizId) {
      slugMap.set(slug, resolvedVizId);
      return resolvedVizId;
    }

    throw new Error(`Unresolved slug ${slug}`);
  };

  // Updates the mapping of a slug to a viz ID in the cache.
  const set = (slug: SlugIdentifier, vizId: VizId) => {
    slugMap.set(slug, vizId);
  };

  // Removes a slug mapping from the cache.
  const invalidate = (slug: SlugIdentifier) => {
    slugMap.delete(slug);
  };

  return { get, set, invalidate };
};
