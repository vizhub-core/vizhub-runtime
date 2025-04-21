import { VizId } from "@vizhub/viz-types";

export type SlugIdentifier = `${string}/${string}`;

export type SlugCache = {
  get: (slug: SlugIdentifier) => Promise<VizId>;
  set: (slug: SlugIdentifier, vizId: VizId) => void;
  invalidate: (slug: SlugIdentifier) => void;
};

// A cache of viz IDs for slug resolution.
// Maps slug strings (username/slug) to viz IDs.
// Side effect: `initialMappings` is mutated to add new mappings.
// This is used to resolve slugs to viz IDs.
export const createSlugCache = ({
  initialMappings = {},
  handleCacheMiss,
}: {
  initialMappings?: Record<SlugIdentifier, VizId>;
  handleCacheMiss?: (
    slug: SlugIdentifier,
  ) => Promise<VizId>;
}): SlugCache => {
  // Gets the viz ID for a slug.
  // Returns the cached ID if it exists.
  // Otherwise, calls handleCacheMiss to resolve the slug.
  const get = async (
    slug: SlugIdentifier,
  ): Promise<VizId> => {
    const cachedVizId: VizId | undefined =
      initialMappings[slug];

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
      initialMappings[slug] = resolvedVizId;
      return resolvedVizId;
    }

    throw new Error(`Unresolved slug ${slug}`);
  };

  // Updates the mapping of a slug to a viz ID in the cache.
  const set = (slug: SlugIdentifier, vizId: VizId) => {
    initialMappings[slug] = vizId;
  };

  // Removes a slug mapping from the cache.
  const invalidate = (slug: SlugIdentifier) => {
    delete initialMappings[slug];
  };

  return { get, set, invalidate };
};
