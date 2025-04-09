/// <reference types="vite/client" />
/// <reference types="vite/client" />

import { VizHubRuntime } from "@vizhub/runtime";

declare global {
  interface Window {
    runtime: VizHubRuntime;
  }
}
