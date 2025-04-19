import {
  FileCollection,
  VizContent,
} from "@vizhub/viz-types";
import {
  fileCollectionToVizFiles,
  generateVizId,
} from "@vizhub/viz-utils";

/**
 * Creates a VizContent object with the given files
 * @param files An object with file names as keys and file content as values
 * @param title Optional title for the content
 * @returns A VizContent object with randomly generated IDs
 */
export const createVizContent = (
  files: FileCollection,
  title = "Sample Content for Exporting",
): VizContent => {
  return {
    id: generateVizId(),
    files: fileCollectionToVizFiles(files),
    title,
  };
};
