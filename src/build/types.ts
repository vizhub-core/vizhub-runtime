// where keys are file names and values are file contents.
export type runtimeVersion = "v1" | "v2" | "v3" | "v4";

// The result from running a build.
export type BuildResult = {
  // Standalone HTML build,
  // including CSS, JS, and files for
  // fetch proxy.
  // This is the srcdoc for the iframe.
  html: string;

  // Isolated CSS styles,
  // for V3 hot reloading case only.
  css?: string;

  // Isolated JS build,
  // for V3 hot reloading case only.
  js?: string;
};
