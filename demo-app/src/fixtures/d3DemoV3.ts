export const d3DemoV3 = {
  label: "D3 Demo (v3)",
  status: "working",
  files: {
    "index.js": `
    import { select, range } from 'd3';
    export const main = (container) => {
      // Create SVG container
      const svg = select(container)
        .selectAll('svg')
        .data([null])
        .join('svg')
        .attr('width', 600)
        .attr('height', 400);
      
      // Generate random data
      const numCircles = 50;
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
      console.log("d3DemoV3 loaded");
    }
  `,
    "package.json": `{
    "dependencies": {
      "d3": "7.9.0"
    },
    "vizhub": {
      "libraries": {
        "d3": {
          "global": "d3",
          "path": "/dist/d3.min.js"
        }
      }
    }
  }`,
  },
};
