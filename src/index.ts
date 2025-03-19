import { magicSandbox, FileCollection } from "magic-sandbox";

export const computeSrcDoc = (files: FileCollection) => magicSandbox(files);
