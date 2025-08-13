// A custom Rollup plugin to:
//  * Implement a virtual file system
//  * Support importing across vizzes
// Unified Rollup plugin for virtual file system and viz imports
// Combines functionalities of 'virtual' and 'importFromViz' plugins
import { InputPluginOption } from "rollup";
import { VizId } from "@vizhub/viz-types";
import { isVizId } from "@vizhub/viz-utils";
import { extractVizImport } from "./extractVizImport.js";
import type { ResolvedVizFileId } from "./types.js";
import { parseId } from "./parseId";
import { SlugCache } from "./slugCache.js";

const debug = false;

export const vizResolve = ({
  vizId,
  slugCache,
}: {
  vizId: VizId;
  slugCache?: SlugCache;
}): InputPluginOption => ({
  name: "vizResolve",
  resolveId: async (
    id: string,
    importer: string | undefined,
  ): Promise<ResolvedVizFileId | undefined> => {
    if (debug) {
      console.log("[vizIdResolve] resolveId() " + id);
      console.log("  importer: " + importer);
    }

    // Handle virtual file system resolution
    // .e.g. `import { foo } from './foo.js'`
    // .e.g. `import { foo } from './foo'`
    if (
      id.startsWith("./") &&
      !importer?.startsWith("https://")
    ) {
      let fileName = id.substring(2);

      // Handle CSS files
      // e.g. `import './styles.css'`
      // Handle JS files
      // e.g. `import { foo } from './foo.js'`
      // e.g. `import { foo } from './foo'`
      // Handle image files
      // e.g. `import logoSrc from './logo.png'`
      if (
        !fileName.endsWith(".js") &&
        !fileName.endsWith(".css") &&
        !fileName.endsWith(".csv") &&
        !fileName.endsWith(".svelte") &&
        !fileName.endsWith(".png") &&
        !fileName.endsWith(".jpg") &&
        !fileName.endsWith(".jpeg") &&
        !fileName.endsWith(".gif") &&
        !fileName.endsWith(".svg") &&
        !fileName.endsWith(".webp") &&
        !fileName.endsWith(".bmp")
      ) {
        fileName += ".js";
      }

      // const js = (name: string) =>
      // name.endsWith('.js') ? name : name + '.js';

      // If there is an importer, then the file is not part of
      // the entry point, so it should be resolved relative
      // to the importer's directory
      if (importer) {
        const {
          vizId: importerVizId,
          fileName: importerFileName,
        } = parseId(importer);
        // Get the directory of the importing file
        const importerDir = importerFileName
          .split("/")
          .slice(0, -1)
          .join("/");
        // Combine the directory with the imported file name
        const resolvedFileName = importerDir
          ? `${importerDir}/${fileName}`
          : fileName;
        return `${importerVizId}/${resolvedFileName}`;
      }
      return vizId + "/" + fileName;
    }

    // Handle viz import resolution
    // e.g. `import { foo } from '@curran/98e6d6509a1e407897d4f238a330efec'`
    // e.g. `import { foo } from '@curran/scatter-plot'`
    const vizImport = extractVizImport(id);
    if (vizImport) {
      let vizId: VizId;
      if (isVizId(vizImport.idOrSlug)) {
        vizId = vizImport.idOrSlug;
      } else {
        if (!slugCache) {
          throw new Error(
            "slugCache is required to import by slug in v3 runtime",
          );
        }

        vizId = await slugCache.get(
          `${vizImport.userName}/${vizImport.idOrSlug}`,
        );
      }
      return vizId + "/index.js";
    }

    // If neither condition is met, return undefined.
    return undefined;
  },
});
