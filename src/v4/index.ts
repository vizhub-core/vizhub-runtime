import type {
  RollupBuild,
  RollupOptions,
  OutputOptions,
} from "rollup";
import { FileCollection } from "@vizhub/viz-types";
import { virtualFileSystem } from "../common/virtualFileSystem.js";
import { sucrasePlugin } from "../common/sucrasePlugin.js";
import {
  dependencies,
  getConfiguredLibraries,
  dependencySource,
} from "../common/packageJson.js";

const DEBUG = false;

/* ------------------------------------------------------------------ */
/*  tiny string/regex helpers                                         */
/* ------------------------------------------------------------------ */

/**  Does the html already contain a <head>…</head> pair? */
const hasTagPair = (html: string, tag: string) =>
  new RegExp(`<${tag}\\b`, "i").test(html) &&
  new RegExp(`</${tag}>`, "i").test(html);

/**  Ensure <html><head></head><body></body> skeleton exists.         */
const normaliseSkeleton = (raw: string): string => {
  const trimmed = raw.trim();

  if (
    hasTagPair(trimmed, "html") &&
    hasTagPair(trimmed, "head") &&
    hasTagPair(trimmed, "body")
  )
    return trimmed;

  return `<html><head></head><body>${trimmed}</body></html>`;
};

/**  Escape characters so they can appear literally inside a RegExp.  */
const escapeRegExp = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**  Inject markup immediately before </head> or </body>.             */
const injectBeforeClose = (
  html: string,
  closing: "</head>" | "</body>",
  markup: string,
) =>
  html.replace(
    new RegExp(closing, "i"),
    `${markup}${closing}`,
  );

/* ------------------------------------------------------------------ */
/*  1.  Extract module entry points                                   */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  2.  Bundle a single ES‑module entry point                          */
/* ------------------------------------------------------------------ */

const bundleESModule = async ({
  entryPoint,
  files,
  rollup,
  enableSourcemap = true,
}: {
  entryPoint: string;
  files: FileCollection;
  rollup: (o: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
}): Promise<string> => {
  const input: RollupOptions = {
    input: `./${entryPoint}`,
    plugins: [virtualFileSystem(files), sucrasePlugin()],
    onwarn(w, warn) {
      if (w.code === "UNRESOLVED_IMPORT") return; // quiet noisy warnings
      warn(w);
    },
  };

  const bundle = await rollup(input);
  const { output } = await bundle.generate({
    format: "es",
    sourcemap: enableSourcemap,
  } as OutputOptions);

  return output[0].code;
};

/* ------------------------------------------------------------------ */
/*  3.  Build import‑map                                              */
/* ------------------------------------------------------------------ */

const generateImportMap = (
  files: FileCollection,
): string | null => {
  const deps = dependencies(files);
  if (Object.keys(deps).length === 0) return null;

  const libraries = getConfiguredLibraries(files);
  const imports: Record<string, string> = {};

  for (const [name, version] of Object.entries(deps)) {
    imports[name] = dependencySource(
      { name, version },
      libraries,
    );
  }
  return JSON.stringify({ imports }, null, 2);
};

/* ------------------------------------------------------------------ */
/*  4.  Update HTML (replace script src + add import‑map)             */
/* ------------------------------------------------------------------ */

const updateHTML = (
  files: FileCollection,
  bundled: Map<string, string>,
): string => {
  if (!files["index.html"]) return "";

  let html = normaliseSkeleton(files["index.html"]);

  /* ---- 4.1 replace each <script src="…"> with inline module ------ */
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

  /* ---- 4.2 add <script type="importmap"> if needed --------------- */
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

  /* ---- 4.3 ensure <!DOCTYPE html> -------------------------------- */
  return /^\s*<!DOCTYPE/i.test(html)
    ? html
    : `<!DOCTYPE html>${html}`;
};

/* ------------------------------------------------------------------ */
/*  5.  Public v4 build                                               */
/* ------------------------------------------------------------------ */

export const v4Build = async ({
  files,
  rollup,
  enableSourcemap = true,
}: {
  files: FileCollection;
  rollup: (o: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
}): Promise<FileCollection> => {
  const html = files["index.html"] || "";
  const entryPoints = extractModuleEntryPoints(html);

  if (entryPoints.length === 0) {
    DEBUG &&
      console.log("[v4Build] No module entry points found");
    return files; // nothing to bundle
  }

  const bundled = new Map<string, string>();
  for (const entry of entryPoints) {
    const code = await bundleESModule({
      entryPoint: entry,
      files,
      rollup,
      enableSourcemap,
    });
    bundled.set(entry, code);
  }

  const updatedHTML = updateHTML(files, bundled);

  return {
    ...files,
    "index.html": updatedHTML,
  };
};

// import type {
//   RollupBuild,
//   RollupOptions,
//   OutputOptions,
// } from "rollup";
// import { JSDOM } from "jsdom";
// import { getParser } from "../common/domParser";
// import { FileCollection } from "@vizhub/viz-types";
// import { virtualFileSystem } from "../common/virtualFileSystem.js";
// import { sucrasePlugin } from "../common/sucrasePlugin.js";
// import {
//   dependencies,
//   getConfiguredLibraries,
//   dependencySource,
// } from "../common/packageJson.js";

// const DEBUG = false;

// /**
//  * Extract module script entry points from index.html
//  */
// const extractModuleEntryPoints = (
//   html: string,
// ): string[] => {
//   const document = getParser().parseFromString(
//     html,
//     "text/html",
//   );

//   const moduleScripts = document.querySelectorAll(
//     'script[type="module"]',
//   );
//   const entryPoints: string[] = [];

//   moduleScripts.forEach((script) => {
//     const src = script.getAttribute("src");
//     if (src) {
//       entryPoints.push(src);
//     }
//   });

//   return entryPoints;
// };

// /**
//  * Bundle an ES module entry point
//  */
// const bundleESModule = async ({
//   entryPoint,
//   files,
//   rollup,
//   enableSourcemap = true,
// }: {
//   entryPoint: string;
//   files: FileCollection;
//   rollup: (options: RollupOptions) => Promise<RollupBuild>;
//   enableSourcemap?: boolean;
// }): Promise<string> => {
//   const inputOptions: RollupOptions = {
//     input: `./${entryPoint}`,
//     plugins: [virtualFileSystem(files), sucrasePlugin()],
//     onwarn(warning, warn) {
//       // Suppress "treating module as external dependency" warnings
//       if (warning.code === "UNRESOLVED_IMPORT") return;
//       warn(warning);
//     },
//   };

//   const bundle = await rollup(inputOptions);

//   const outputOptions: OutputOptions = {
//     format: "es",
//     sourcemap: enableSourcemap,
//   };

//   const { output } = await bundle.generate(outputOptions);
//   return output[0].code;
// };

// /**
//  * Generate an import map for all dependencies
//  */
// const generateImportMap = (
//   files: FileCollection,
// ): string | null => {
//   const deps = dependencies(files);
//   if (Object.keys(deps).length === 0) {
//     return null;
//   }

//   const libraries = getConfiguredLibraries(files);
//   const imports: Record<string, string> = {};

//   Object.entries(deps).forEach(([name, version]) => {
//     const url = dependencySource(
//       { name, version },
//       libraries,
//     );
//     imports[name] = url;
//   });

//   return JSON.stringify({ imports }, null, 2);
// };

// /**
//  * Update HTML to include import map and bundled modules
//  */
// const updateHTML = (
//   files: FileCollection,
//   bundledModules: Map<string, string>,
// ): string => {
//   const html = files["index.html"] || "";
//   if (!html) {
//     return "";
//   }

//   const document = getParser().parseFromString(
//     html,
//     "text/html",
//   );

//   // Replace script src with bundled content
//   bundledModules.forEach((code, src) => {
//     const scripts = document.querySelectorAll(
//       `script[src="${src}"]`,
//     );
//     scripts.forEach((script) => {
//       const newScript = document.createElement("script");
//       newScript.setAttribute("type", "module");
//       newScript.textContent = code;
//       script.parentNode?.replaceChild(newScript, script);
//     });
//   });

//   // Add import map if needed
//   const importMap = generateImportMap(files);
//   if (importMap) {
//     // Check if import map already exists
//     const existingImportMap = document.querySelector(
//       'script[type="importmap"]',
//     );
//     if (!existingImportMap) {
//       const importMapScript =
//         document.createElement("script");
//       importMapScript.setAttribute("type", "importmap");
//       importMapScript.textContent = importMap;

//       const head =
//         document.head || document.querySelector("head");
//       if (head) {
//         head.prepend(importMapScript);
//       } else {
//         const html = document.documentElement;
//         const newHead = document.createElement("head");
//         newHead.appendChild(importMapScript);
//         html.insertBefore(newHead, html.firstChild);
//       }
//     }
//   }

//   return `<!DOCTYPE html>${document.documentElement.outerHTML}`;
// };

// /**
//  * Build for v4 runtime
//  */
// export const v4Build = async ({
//   files,
//   rollup,
//   enableSourcemap = true,
// }: {
//   files: FileCollection;
//   rollup: (options: RollupOptions) => Promise<RollupBuild>;
//   enableSourcemap?: boolean;
// }): Promise<FileCollection> => {
//   // Extract entry points
//   const html = files["index.html"] || "";
//   const entryPoints = extractModuleEntryPoints(html);

//   if (entryPoints.length === 0) {
//     DEBUG &&
//       console.log("[v4Build] No module entry points found");
//     // Fall back to a default approach if no module entry points
//     // Just return the HTML as-is if there are no module scripts
//     return files;
//   }

//   // Bundle each entry point
//   const bundledModules = new Map<string, string>();
//   for (const entryPoint of entryPoints) {
//     const code = await bundleESModule({
//       entryPoint,
//       files,
//       rollup,
//       enableSourcemap,
//     });
//     bundledModules.set(entryPoint, code);
//   }

//   // Update HTML with bundled modules and import map
//   const updatedHTML = updateHTML(files, bundledModules);

//   return {
//     ...files,
//     "index.html": updatedHTML,
//   };
// };
