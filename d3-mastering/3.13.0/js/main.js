/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/

const WIDTH = 600;
const HEIGHT = 500;
const MARGIN = 50;

main();

async function main() {
  const data = await loadData();
  const svg = prepareGraph();
  showGraph(svg, data);
}

async function loadData() {
  const data = await d3.json('data/revenues.json');
  return data.map(({month, revenue, profit}) => ({
    month,
    revenue: +revenue,
    profit: +profit,
  }));
}

function prepareGraph() {
  const svg = d3.select('#chart-area').append('svg');
  return svg
    .attr('width', WIDTH)
    .attr('height', HEIGHT);
}

/*
data: {
  month: "January"
  revenue: "13432"
  profit: "8342"
}
*/
function showGraph(svg, data) {
  const scaleY = d3.scaleLinear()
    .domain([0,  d3.max(data, d => d.revenue)])
    .range([HEIGHT - MARGIN * 2, 0]);
  const scaleX = d3.scaleBand()
    .domain(data.map(d => d.month))
    .range([0, WIDTH - MARGIN * 2])
    .paddingInner(.3)
    .paddingOuter(.3);
  const g = svg.append('g')
    // .attr('transform', `translate(${ MARGIN }, ${ MARGIN })`)
  const rects = g
    .selectAll('rect')
    .data(data);
  rects.enter()
    .append('rect')
    .attr('x', d => scaleX(d.month) + MARGIN)
    .attr('y', d => scaleY(d.revenue) + MARGIN  )
    .attr('width', scaleX.bandwidth)
    .attr('height', d => (HEIGHT - MARGIN * 2) - scaleY(d.revenue))
    .attr('fill', '#007041');

    const axisLeftCall = d3.axisLeft(scaleY);
    g.append('g')
      .attr('class', 'y-scale')
      .attr('transform', `translate(${ MARGIN }, ${ MARGIN })`)
      .call(axisLeftCall);

    const axisBottomCall = d3.axisBottom(scaleX);
    g.append('g')
      .attr('class', 'x-scale')
      .attr('transform', `translate(${ MARGIN }, ${ HEIGHT - MARGIN })`)
      .call(axisBottomCall);
  }
