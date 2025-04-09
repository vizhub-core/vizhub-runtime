import { FileCollection } from "@vizhub/viz-types";
import {
  normaliseSkeleton,
  escapeRegExp,
  injectBeforeClose,
} from "./stringUtils.js";
import { generateImportMap } from "./importMap.js";

/**
 * Update HTML to include import map and bundled modules
 */
export const updateHTML = (
  files: FileCollection,
  bundled: Map<string, string>,
): string => {
  if (!files["index.html"]) return "";

  let html = normaliseSkeleton(files["index.html"]);

  // Replace each <script src="…"> with inline module
  bundled.forEach((code, src) => {
    const tagRe = new RegExp(
      `<script\\b[^>]*\\bsrc=["']${escapeRegExp(src)}["'][^>]*>[^<]*</script>`,
      "gi",
    );
    html = html.replace(
      tagRe,
      `<script type="module">\n${code}\n</script>`,
    );
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

  // Ensure <!DOCTYPE html>
  return /^\s*<!DOCTYPE/i.test(html)
    ? html
    : `<!DOCTYPE html>${html}`;
};
