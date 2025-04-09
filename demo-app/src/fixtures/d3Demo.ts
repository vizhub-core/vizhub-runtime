export const d3Demo = {
  "index.html": `<!DOCTYPE html>
  <html>
    <head>
      <title>D3 Visualization Demo</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        #chart {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          padding: 20px;
          margin: 0 auto;
          max-width: 800px;
        }
        h1 {
          text-align: center;
          color: #333;
        }
        .bar {
          transition: fill 0.3s ease;
        }
        .bar:hover {
          fill: #ff7f0e;
        }
      </style>
    </head>
    <body>
      <h1>Interactive Bar Chart with D3</h1>
      <div id="chart"></div>
      <script type="module" src="index.js"></script>
    </body>
  </html>`,
  "index.js": `import * as d3 from 'd3';

// Sample data
const data = [
  { name: 'A', value: 30 },
  { name: 'B', value: 45 },
  { name: 'C', value: 25 },
  { name: 'D', value: 60 },
  { name: 'E', value: 38 },
  { name: 'F', value: 52 },
  { name: 'G', value: 70 }
];

// Set up dimensions and margins
const margin = { top: 30, right: 30, bottom: 40, left: 50 };
const width = 700 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', \`translate(\${margin.left},\${margin.top})\`);

// Create scales
const x = d3.scaleBand()
  .domain(data.map(d => d.name))
  .range([0, width])
  .padding(0.2);

const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)])
  .range([height, 0]);

// Add X axis
svg.append('g')
  .attr('transform', \`translate(0,\${height})\`)
  .call(d3.axisBottom(x))
  .selectAll('text')
  .style('font-size', '12px');

// Add Y axis
svg.append('g')
  .call(d3.axisLeft(y))
  .selectAll('text')
  .style('font-size', '12px');

// Add Y axis label
svg.append('text')
  .attr('transform', 'rotate(-90)')
  .attr('y', -margin.left + 15)
  .attr('x', -height / 2)
  .attr('text-anchor', 'middle')
  .text('Value')
  .style('font-size', '14px');

// Create and animate bars
svg.selectAll('.bar')
  .data(data)
  .enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('x', d => x(d.name))
  .attr('width', x.bandwidth())
  .attr('y', height)
  .attr('height', 0)
  .attr('fill', '#4285f4')
  .transition()
  .duration(800)
  .delay((d, i) => i * 100)
  .attr('y', d => y(d.value))
  .attr('height', d => height - y(d.value));

// Add value labels on top of bars
svg.selectAll('.label')
  .data(data)
  .enter()
  .append('text')
  .attr('class', 'label')
  .attr('x', d => x(d.name) + x.bandwidth() / 2)
  .attr('y', d => y(d.value) - 5)
  .attr('text-anchor', 'middle')
  .text(d => d.value)
  .style('font-size', '12px')
  .style('opacity', 0)
  .transition()
  .duration(800)
  .delay((d, i) => i * 100 + 400)
  .style('opacity', 1);

// Add interactivity
svg.selectAll('.bar')
  .on('mouseover', function(event, d) {
    d3.select(this)
      .transition()
      .duration(300)
      .attr('fill', '#ff7f0e');
    
    svg.append('text')
      .attr('class', 'tooltip')
      .attr('x', x(d.name) + x.bandwidth() / 2)
      .attr('y', y(d.value) - 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(\`\${d.name}: \${d.value}\`);
  })
  .on('mouseout', function() {
    d3.select(this)
      .transition()
      .duration(300)
      .attr('fill', '#4285f4');
    
    svg.selectAll('.tooltip').remove();
  });

console.log('D3 chart rendered successfully');`,
  "package.json": `{
  "dependencies": {
    "d3": "^7.8.5"
  }
}`,
};
