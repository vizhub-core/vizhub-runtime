import { FileCollection } from "@vizhub/viz-types";
import {
  normaliseSkeleton,
  escapeRegExp,
  injectBeforeClose,
} from "./stringUtils.js";
import { generateImportMap } from "./importMap.js";
import { getRuntimeErrorHandlerScript } from "../common/runtimeErrorHandling.js";

/**
 * Update HTML to include import map and bundled modules
 */
export const updateHTML = (
  files: FileCollection,
  bundled: Map<string, string>,
  inlineScripts: Array<{ id: string; content: string }> = [],
): string => {
  if (!files["index.html"]) return "";

  let html = normaliseSkeleton(files["index.html"]);

  // Replace each <script src="…"> with inline module
  bundled.forEach((code, src) => {
    // Check if this is an inline script
    const isInlineScript = inlineScripts.some(script => script.id === src);
    
    if (isInlineScript) {
      // Find and replace the inline script tag
      const inlineScriptContent = inlineScripts.find(script => script.id === src)?.content || '';
      const escapedContent = escapeRegExp(inlineScriptContent);
      const inlineTagRe = new RegExp(
        `<script\\b[^>]*\\btype=["']module["'][^>]*>\\s*${escapedContent}\\s*</script>`,
        'gi'
      );
      html = html.replace(
        inlineTagRe,
        `<script type="module">\n${code}\n</script>`,
      );
    } else {
      // Handle src-based scripts
      const tagRe = new RegExp(
        `<script\\b[^>]*\\bsrc=["']${escapeRegExp(src)}["'][^>]*>[^<]*</script>`,
        "gi",
      );
      html = html.replace(
        tagRe,
        `<script type="module">\n${code}\n</script>`,
      );
    }
  });

  // Add <script type="importmap"> if needed
  const importMapJson = generateImportMap(files);
  if (importMapJson) {
    const already =
      /<script\b[^>]*type=["']importmap["'][^>]*>/i.test(
        html,
      );

    if (!already) {
      const importMapTag = `<script type="importmap">\n${importMapJson}\n</script>\n`;
      html = injectBeforeClose(
        html,
        "</head>",
        importMapTag,
      );
    }
  }

  // Add runtime error handler script
  const errorHandlerScript = `<script>${getRuntimeErrorHandlerScript()}</script>\n`;
  html = injectBeforeClose(html, "</head>", errorHandlerScript);

  // Ensure <!DOCTYPE html>
  return /^\s*<!DOCTYPE/i.test(html)
    ? html
    : `<!DOCTYPE html>${html}`;
};
