import type {
  RollupBuild,
  RollupOptions,
  OutputOptions,
} from "rollup";
import { JSDOM } from "jsdom";
import { virtualFileSystem } from "../common/virtualFileSystem";
import { sucrasePlugin } from "../common/sucrasePlugin";
import {
  dependencies,
  getConfiguredLibraries,
  dependencySource,
} from "../common/packageJson";
import { FileCollection } from "@vizhub/viz-types";

const DEBUG = false;

/**
 * Extract module script entry points from index.html
 */
const extractModuleEntryPoints = (
  html: string,
): string[] => {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const moduleScripts = document.querySelectorAll(
    'script[type="module"]',
  );
  const entryPoints: string[] = [];

  moduleScripts.forEach((script) => {
    const src = script.getAttribute("src");
    if (src) {
      entryPoints.push(src);
    }
  });

  return entryPoints;
};

/**
 * Bundle an ES module entry point
 */
const bundleESModule = async ({
  entryPoint,
  files,
  rollup,
  enableSourcemap = true,
}: {
  entryPoint: string;
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
}): Promise<string> => {
  const inputOptions: RollupOptions = {
    input: `./${entryPoint}`,
    plugins: [virtualFileSystem(files), sucrasePlugin()],
    onwarn(warning, warn) {
      // Suppress "treating module as external dependency" warnings
      if (warning.code === "UNRESOLVED_IMPORT") return;
      warn(warning);
    },
  };

  const bundle = await rollup(inputOptions);

  const outputOptions: OutputOptions = {
    format: "es",
    sourcemap: enableSourcemap,
  };

  const { output } = await bundle.generate(outputOptions);
  return output[0].code;
};

/**
 * Generate an import map for all dependencies
 */
const generateImportMap = (
  files: FileCollection,
): string | null => {
  const deps = dependencies(files);
  if (Object.keys(deps).length === 0) {
    return null;
  }

  const libraries = getConfiguredLibraries(files);
  const imports: Record<string, string> = {};

  Object.entries(deps).forEach(([name, version]) => {
    const url = dependencySource(
      { name, version },
      libraries,
    );
    imports[name] = url;
  });

  return JSON.stringify({ imports }, null, 2);
};

/**
 * Update HTML to include import map and bundled modules
 */
const updateHTML = (
  files: FileCollection,
  bundledModules: Map<string, string>,
): string => {
  const html = files["index.html"] || "";
  if (!html) {
    return "";
  }

  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Replace script src with bundled content
  bundledModules.forEach((code, src) => {
    const scripts = document.querySelectorAll(
      `script[src="${src}"]`,
    );
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      newScript.setAttribute("type", "module");
      newScript.textContent = code;
      script.parentNode?.replaceChild(newScript, script);
    });
  });

  // Add import map if needed
  const importMap = generateImportMap(files);
  if (importMap) {
    // Check if import map already exists
    const existingImportMap = document.querySelector(
      'script[type="importmap"]',
    );
    if (!existingImportMap) {
      const importMapScript =
        document.createElement("script");
      importMapScript.setAttribute("type", "importmap");
      importMapScript.textContent = importMap;

      const head =
        document.head || document.querySelector("head");
      if (head) {
        head.prepend(importMapScript);
      } else {
        const html = document.documentElement;
        const newHead = document.createElement("head");
        newHead.appendChild(importMapScript);
        html.insertBefore(newHead, html.firstChild);
      }
    }
  }

  return `<!DOCTYPE html>${document.documentElement.outerHTML}`;
};

/**
 * Build for v4 runtime
 */
export const v4Build = async ({
  files,
  rollup,
  enableSourcemap = true,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
}): Promise<FileCollection> => {
  // Extract entry points
  const html = files["index.html"] || "";
  const entryPoints = extractModuleEntryPoints(html);

  if (entryPoints.length === 0) {
    DEBUG &&
      console.log("[v4Build] No module entry points found");
    // Fall back to a default approach if no module entry points
    // Just return the HTML as-is if there are no module scripts
    return files;
  }

  // Bundle each entry point
  const bundledModules = new Map<string, string>();
  for (const entryPoint of entryPoints) {
    const code = await bundleESModule({
      entryPoint,
      files,
      rollup,
      enableSourcemap,
    });
    bundledModules.set(entryPoint, code);
  }

  // Update HTML with bundled modules and import map
  const updatedHTML = updateHTML(files, bundledModules);

  return {
    ...files,
    "index.html": updatedHTML,
  };
};
