/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const SVG_WIDTH = 600;
const SVG_HEIGHT = 500;
const GRAPH_MARGIN = 75;

main();

async function main() {
  const data = await loadData();
  const svg = prepareGraph();
  showGraph(svg, data);
}

async function loadData() {
  const data = await d3.json('data/data.json');
  return data.map(({countries, year}) => ({
		year: +year,
		// remove countries w/o data
    countries: countries.filter(c => c.income && c.life_exp),
  }));
}

function prepareGraph() {
  const svg = d3.select('#chart-area').append('svg');
  return svg
    .attr('width', SVG_WIDTH)
    .attr('height', SVG_HEIGHT);
}

/*
data: [
	{
  	countries: [
			continent: "europe"
			country: "Greece"
			income: 25884
			life_exp: 78.9
			population: 11184398
		],
  	year: "1800"
	}
]
*/
function showGraph(svg, data) {
	let index = -1;
	const maxLifeExp = d3.max(data, ({countries}) => d3.max(countries, c => c.life_exp));
	const maxIncome = d3.max(data, ({countries}) => d3.max(countries, c => c.income));
	const maxPopulation = d3.max(data, ({countries}) => d3.max(countries, c => c.population));

	console.log(JSON.stringify([maxLifeExp, maxIncome, maxPopulation]));

  const scaleX = d3.scaleLog()
		.base(10)
		// TODO: add real maximum domain
    .domain([142, 150000])
    // .domain([142, maxLifeExp])
		.range([0, SVG_WIDTH - GRAPH_MARGIN * 2]);
	const scaleY = d3.scaleLinear()
		// TODO: add real maximum domain
    .domain([0, 90])
    // .domain([0, maxIncome])
    .range([SVG_HEIGHT - GRAPH_MARGIN * 2, 0]);
	const scaleRadius = d3.scaleLinear()
		.domain([2000, 1400000000])
		.range([5, 25]);
  const g = svg.append('g');
  const circles = g
    .selectAll('circle')
    .data([]);

		// TODO: Use TickValues() to manually set our x-axis values of 400, 4,000, and 40,000.
    // const axisLeftCall = d3.axisLeft(scaleY)
    //   .tickFormat(d => `$${ d }`);
    // g.append('g')
    //   .attr('class', 'y-scale')
    //   .attr('transform', `translate(${ GRAPH_MARGIN }, ${ GRAPH_MARGIN })`)
    //   .call(axisLeftCall);

    // const axisBottomCall = d3.axisBottom(scaleX);
    // g.append('g')
    //   .attr('class', 'x-scale')
    //   .attr('transform', `translate(${ GRAPH_MARGIN }, ${ SVG_HEIGHT - GRAPH_MARGIN })`)
    //   .call(axisBottomCall);

    g.append('text')
      .attr('x', -SVG_HEIGHT / 2)
      .attr('y', 10)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text('life expectancy');

    g.append('text')
      .attr('x', SVG_WIDTH / 2)
      .attr('y', SVG_HEIGHT - GRAPH_MARGIN / 3)
      .attr('text-anchor', 'middle')
      .text('GDP-per-capita');


		d3.interval(() => {
			// update data index
			index ++;
			if (index >= data.length) {
				index = 0;
			}

		const circles = g
			.selectAll('circle')
			.data(data[index].countries, item => item.country);

		// console.log(scaleX(10));
		// console.log(circles);
		
		// exits
		circles.exit()
			// TODO: add animation here
			.remove();

		// enters circles
		circles
			.enter()
			.append('circle')
			.merge(circles)
			.attr('cx', d => scaleX(d.income) + GRAPH_MARGIN)
			.attr('cy', d => scaleY(d.life_exp) + GRAPH_MARGIN  )
			// A/pi = r^2
			.attr('r', d => scaleRadius(d.population))
			// .attr('height', d => (SVG_HEIGHT - GRAPH_MARGIN * 2) - scaleY(d.revenue))
			.attr('fill', '#007041');

		}, 500);
  }
