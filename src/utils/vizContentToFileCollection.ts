import type { VizContent } from "@vizhub/viz-types";
import type { FileCollection } from "magic-sandbox";

/**
 * Converts VizContent format to FileCollection format
 * VizContent has files as {id: {name, text}} structure
 * FileCollection is a simple {name: text} structure
 */
export const vizContentToFileCollection = (
  vizContent: VizContent
): FileCollection => {
  const fileCollection: FileCollection = {};
  
  // Extract files from vizContent
  const { files } = vizContent;
  
  // Return empty object if files is undefined
  if (!files) {
    return fileCollection;
  }
  
  // Convert each VizFile to the FileCollection format
  Object.values(files).forEach((file) => {
    fileCollection[file.name] = file.text;
  });
  
  return fileCollection;
};
