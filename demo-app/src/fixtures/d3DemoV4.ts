import { VizHubRuntimeFixture } from "./types";

export const d3DemoV4: VizHubRuntimeFixture = {
  label: "D3 Demo (v4)",
  status: "working",
  files: {
    "index.html": `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>D3 Demo via jsDelivr + Import Maps</title>
    <script type="importmap">
      {
        "imports": {
          "d3": "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm"
        }
      }
    </script>
  </head>
  <body>
    <div id="container"></div>
    <script type="module" src="./index.js"></script>
  </body>
</html>
  `,
    "index.js": `
    import { select, range } from 'd3';

    export const numCircles = 50;

    export const main = (container) => {
      // Create SVG container
      const svg = select(container)
        .selectAll('svg')
        .data([null])
        .join('svg')
        .attr('width', 600)
        .attr('height', 400);
      
      // Generate random data
      const data = range(numCircles).map(() => ({
        x: Math.random() * 600,
        y: Math.random() * 400,
        r: Math.random() * 20 + 5
      }));
      
      // Create circles
      svg.selectAll('circle')
        .data(data)
        .join('circle')
        .transition()
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.r)
        .style('fill', 'steelblue')
        .style('opacity', 0.7);
      
      console.log("d3DemoV4 loaded");
    };

    // Initialize the visualization
    const container = document.getElementById('container');
    if (container) {
      main(container);
    }
  `,
  },
};
