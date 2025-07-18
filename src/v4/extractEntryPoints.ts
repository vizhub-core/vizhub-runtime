/**
 * Extract module script entry points from index.html
 */
export const extractModuleEntryPoints = (
  html: string,
): {
  entryPoints: string[];
  inlineScripts: Array<{ id: string; content: string }>;
} => {
  const entryPoints: string[] = [];
  const inlineScripts: Array<{ id: string; content: string }> = [];
  const scriptTag = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  let inlineScriptCounter = 0;

  while ((m = scriptTag.exec(html)) !== null) {
    const attrs = m[1];
    const content = m[2];
    
    if (!/\btype\s*=\s*["']module["']/i.test(attrs))
      continue;
    
    const srcMatch = attrs.match(
      /\bsrc\s*=\s*["']([^"']+)["']/i,
    );
    
    if (srcMatch) {
      entryPoints.push(srcMatch[1]);
    } else if (content.trim()) {
      // Handle inline script
      const inlineId = `__inline_script_${inlineScriptCounter++}.js`;
      inlineScripts.push({
        id: inlineId,
        content: content.trim(),
      });
      entryPoints.push(inlineId);
    }
  }
  
  return { entryPoints, inlineScripts };
};
