export const d3DemoV2 = {
  label: "D3 Demo (v2)",
  status: "working",
  files: {
    "index.html": `
  <html>
    <head>
      <style>
        body {
          margin: 0;
          overflow: hidden;
        }
      </style>
    </head>
    <body>
      <div id="chart"></div>
      <script src='bundle.js'></script>
    </body>
  `,
    "index.js": `
    import { select } from "d3";
    
    // Data for our bar chart
    const data = [30, 86, 168, 281, 303, 365];
    
    // Set dimensions and margins
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = select('#chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Create container group and transform it
    const g = svg.append('g')
      .attr('transform', \`translate(\${margin.left},\${margin.top})\`);
    
    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map((d, i) => i))
      .range([0, innerWidth])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([innerHeight, 0]);
    
    // Create and append the bars
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => xScale(i))
      .attr('y', d => yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d))
      .attr('fill', 'steelblue');
    
    // Add x-axis
    g.append('g')
      .attr('transform', \`translate(0,\${innerHeight})\`)
      .call(d3.axisBottom(xScale));
    
    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale));
    console.log("d3DemoV2 loaded");
  `,
    "package.json": `{
    "dependencies": {
      "d3": "6.7.0"
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
