import { VizContent } from "@vizhub/viz-types";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates a VizContent object with the given files
 * @param files An object with file names as keys and file content as values
 * @param title Optional title for the content
 * @returns A VizContent object with randomly generated IDs
 */
export const createVizContent = (
  files: Record<string, string>,
  title = "Sample Content for Exporting",
): VizContent => {
  const contentId = uuidv4().replace(/-/g, "");

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

// Content for testing JS imports
export const sampleVizContent: VizContent =
  createVizContent({
    "index.js": `
    import { innerMessage } from './message';
    export const message = "Outer " + innerMessage;
  `,
    "message.js": `
    export const innerMessage = "Inner";
  `,
  });
