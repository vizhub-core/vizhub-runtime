import { FileCollection } from "../types";

export type Licence = string;

export interface PackageJson {
  dependencies?: {
    [key: string]: string;
  };
  vizhub?: {
    libraries?: {
      [key: string]: VizHubLibraryConfig;
    };
  };
  license?: Licence | { type: string };
}

const EMPTY_PKG_JSON: PackageJson = {
  dependencies: {},
  vizhub: {},
  license: "MIT",
};

export interface Dependency {
  name: string;
  version: string;
}

export interface VizHubLibraryConfig {
  path?: string;
  global?: string;
}

export interface VizHubLibraryConfigs {
  [key: string]: VizHubLibraryConfig;
}

const DEBUG = false;

export const packageJSON = (files: FileCollection): PackageJson => {
  const packageJsonText = files["package.json"];
  DEBUG && console.log("[packageJSON] packageJsonText:", packageJsonText);
  try {
    const pkg = packageJsonText ? JSON.parse(packageJsonText) : EMPTY_PKG_JSON;
    DEBUG && console.log("[packageJSON] pkg:", JSON.stringify(pkg, null, 2));
    return pkg;
  } catch {
    DEBUG && console.log("[packageJSON] Error parsing package.json");
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
  libraries: VizHubLibraryConfigs
) => {
  const path = libraries[name] ? libraries[name].path || "" : "";
  return `https://unpkg.com/${name}@${version}${path}`;
};

export const getLicense = (files: FileCollection) => {
  const license = packageJSON(files).license;
  if (typeof license === "object" && license !== null && "type" in license) {
    return license.type;
  }
  return license || EMPTY_PKG_JSON.license;
};
