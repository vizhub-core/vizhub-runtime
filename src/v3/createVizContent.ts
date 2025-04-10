import {
  FileCollection,
  VizContent,
} from "@vizhub/viz-types";
import { generateVizId } from "@vizhub/viz-utils";

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
  const contentId = generateVizId();

  const contentFiles: Record<
    string,
    { name: string; text: string }
  > = {};

  Object.entries(files).forEach(
    ([fileName, fileContent]) => {
      const fileId = Math.floor(
        Math.random() * 10000000,
      ).toString();
      contentFiles[fileId] = {
        name: fileName,
        text: fileContent,
      };
    },
  );

  return {
    id: contentId,
    files: contentFiles,
    title,
  };
};
