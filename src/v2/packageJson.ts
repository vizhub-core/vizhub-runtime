import { FileCollection } from "../types";

const EMPTY_PKG_JSON = {
  dependencies: {},
  vizhub: {},
  license: "MIT",
};

export interface Dependency {
  name: string;
  version: string;
}

export interface Library {
  path?: string;
}

export interface Libraries {
  [key: string]: Library;
}

export const packageJSON = (files: FileCollection) => {
  const packageJsonText = files["package.json"];
  try {
    const pkg = packageJsonText ? JSON.parse(packageJsonText) : EMPTY_PKG_JSON;
    return pkg;
  } catch {
    return EMPTY_PKG_JSON;
  }
};

export const dependencies = (files: FileCollection) =>
  packageJSON(files).dependencies || {};

export const getConfiguredLibraries = (files: FileCollection) => {
  const vizhubConfig = packageJSON(files).vizhub || {};
  return vizhubConfig.libraries || {};
};

export const dependencySource = (
  { name, version }: Dependency,
  libraries: Libraries
) => {
  const path = libraries[name] ? libraries[name].path || "" : "";
  // unpkg uses file from unpkg or main field when no file specifid in url
  return `https://unpkg.com/${name}@${version}${path}`;
};

export const getLicense = (files: FileCollection) =>
  packageJSON(files).license || EMPTY_PKG_JSON.license;
