import { VizFiles } from "@vizhub/viz-types";
// @ts-ignore
import magicSandbox from "magic-sandbox";

// Isolate the HTML entry point.
const template = (files: VizFiles) => {
  const indexHtml = Object.values(files).find(
    (file) => file.name === "index.html"
  );
  return indexHtml ? indexHtml.text : "";
};

// Transform into the data structure expected by magic-sandbox.
const transform = (files: VizFiles) =>
  Object.values(files)
    .filter((file) => file.name !== "index.html")
    .reduce((accumulator, file) => {
      accumulator[file.name] = {
        content: file.text,
      };
      return accumulator;
    }, {} as Record<string, { content: string }>);

// Compute the srcdoc from the files.
export const computeSrcDoc = (files: VizFiles) =>
  magicSandbox(template(files), transform(files));
