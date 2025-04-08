import { InputPluginOption } from "rollup";
import type { ResolvedVizFileId } from "../types";
import { parseId } from "../parseId";
import { dsvParseSrc } from "./dsvParseSrc.js";

const DEBUG = false;

// Escape backticks in a string so that it can be
// used in a template literal. Also need to escape backslashes.
const escapeBackticks = (str: string) =>
  // str.replace(/`/g, '\\`');
  str.replace(/\\/g, "\\\\").replace(/`/g, "\\`");

// Responsible for loading CSV and TSV files, which are
// in general called Delimiter-Separated Values (DSV).
export const transformDSV = (): InputPluginOption => ({
  name: "transformDSV",

  // `id` here is of the form
  // `{vizId}/{fileName}`
  transform: async (
    text: string,
    id: ResolvedVizFileId,
  ) => {
    DEBUG && console.log("[transformDSV]: load() " + id);
    const { vizId, fileName } = parseId(id);

    DEBUG &&
      console.log("  [transformDSV] vizId: " + vizId);
    DEBUG &&
      console.log("  [transformDSV] fileName: " + fileName);
    const isCSV = fileName.endsWith(".csv");
    const isTSV = fileName.endsWith(".tsv");
    if (isCSV || isTSV) {
      DEBUG &&
        console.log(
          "    [transformDSV] tracking DSV import for " +
            id,
        );

      const parseFunction = isCSV ? "csvParse" : "tsvParse";

      return {
        code: `
            ${dsvParseSrc}
            const data = ${parseFunction}(\`${escapeBackticks(text)}\`);
            export default data;
          `,
        map: { mappings: "" },
      };
    }
    return undefined;
  },
});
