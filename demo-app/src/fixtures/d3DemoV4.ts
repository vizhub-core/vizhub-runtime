export const d3DemoV4 = {
  "index.html": `<!DOCTYPE html>
  <html>
    <head>
      <title>D3 Test</title>
    </head>
    <body>
      <div id="chart"></div>
      <script type="module" src="index.js"></script>
    </body>
  </html>`,
  "index.js": `import * as d3 from 'd3';

const svg = d3.select('#chart')
  .append('svg')
  .attr('width', 100)
  .attr('height', 100);

svg.append('circle')
  .attr('cx', 50)
  .attr('cy', 50)
  .attr('r', 40)
  .style('fill', 'blue');

console.log('D3 chart rendered successfully');`,
  "package.json": `{
  "dependencies": {
    "d3": "^7.8.5"
  }
}`,
};
