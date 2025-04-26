import { VizHubRuntimeFixture } from "./types";

export const svelteDemoV3: VizHubRuntimeFixture = {
  label: "Svelte Demo (v3)",
  status: "working",
  vizId: "9346fa307f004ac48bffd3539709e5be",
  files: {
    "App.svelte": `<script>
  const data = [
    { x: 155, y: 384, r: 20, fill: '#03045e' },
    { x: 340, y: 238, r: 52, fill: '#023e8a' },
    { x: 531, y: 151, r: 20, fill: '#0096c7' },
    { x: 482, y: 307, r: 147, fill: '#0096c7' },
    { x: 781, y: 91, r: 61, fill: '#00b4d8' },
    { x: 668, y: 229, r: 64, fill: '#48cae4' },
  ];
</script>

<main>
  <svg width="1000" height="500">
    {#each data as { x, y, r, fill }}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={fill}
      />
    {/each}
  </svg>
</main>

<style>
  svg {
    background: rgba(255, 168, 0, 0.3);
  }

  circle {
    opacity: 0.7;
  }
</style>`,
    "index.js": `import App from './App.svelte';

export const main = (container) => {
  const app = new App({
    target: container,
    hydrate: true,
  });
};
`,
    "package.json": `{
  "dependencies": {
    "d3": "7.8.5"
  },
  "vizhub": {
    "libraries": {
      "d3": {
        "global": "d3",
        "path": "/dist/d3.min.js"
      }
    }
  }
}
`,
  },
};
