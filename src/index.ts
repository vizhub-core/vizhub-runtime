import magicSandbox from "./magicSandbox";

type FileCollection = Record<string, { content: string }>;

export const computeSrcDoc = (files: FileCollection) => magicSandbox(files);
