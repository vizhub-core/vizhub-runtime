/**
 * Extract module script entry points from index.html
 */
export const extractModuleEntryPoints = (
  html: string,
): string[] => {
  const entryPoints: string[] = [];
  const scriptTag = /<script\b([^>]*)>[\s\S]*?<\/script>/gi;
  let m: RegExpExecArray | null;

  while ((m = scriptTag.exec(html)) !== null) {
    const attrs = m[1];
    if (!/\btype\s*=\s*["']module["']/i.test(attrs))
      continue;
    const srcMatch = attrs.match(
      /\bsrc\s*=\s*["']([^"']+)["']/i,
    );
    if (srcMatch) entryPoints.push(srcMatch[1]);
  }
  return entryPoints;
};
