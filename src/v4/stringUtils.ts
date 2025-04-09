/**
 * Does the html already contain a <tag>…</tag> pair?
 */
export const hasTagPair = (html: string, tag: string) =>
  new RegExp(`<${tag}\\b`, "i").test(html) &&
  new RegExp(`</${tag}>`, "i").test(html);

/**
 * Ensure <html><head></head><body></body> skeleton exists.
 */
export const normaliseSkeleton = (raw: string): string => {
  const trimmed = raw.trim();

  if (
    hasTagPair(trimmed, "html") &&
    hasTagPair(trimmed, "head") &&
    hasTagPair(trimmed, "body")
  )
    return trimmed;

  return `<html><head></head><body>${trimmed}</body></html>`;
};

/**
 * Escape characters so they can appear literally inside a RegExp.
 */
export const escapeRegExp = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Inject markup immediately before </head> or </body>.
 */
export const injectBeforeClose = (
  html: string,
  closing: "</head>" | "</body>",
  markup: string,
) =>
  html.replace(
    new RegExp(closing, "i"),
    `${markup}${closing}`,
  );
