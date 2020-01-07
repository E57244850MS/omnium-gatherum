/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const margin = { left:80, right:20, top:50, bottom:100 };
const height = 500 - margin.top - margin.bottom;
const width = 800 - margin.left - margin.right;

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
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom);
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
	const allYearCountries = data.reduce((all, item) => all.concat(item.countries), []);
	const incomeExtent = d3.extent(allYearCountries, c => c.income);
	const lifeExpExtent = d3.extent(allYearCountries, c => c.life_exp);
	const populationExtent = d3.extent(allYearCountries, c => c.population);

	console.log(incomeExtent, lifeExpExtent, populationExtent);

  const scaleX = d3.scaleLog()
		.base(10)
    .domain(incomeExtent)
		.range([0, width]);
	const scaleY = d3.scaleLinear()
    .domain(lifeExpExtent)
    .range([height, 0]);
	const scaleRadius = d3.scaleLinear()
		.domain(populationExtent)
		.range([25 * Math.PI, 1500 * Math.PI]);
  const g = svg.append('g')
		.attr('transform', `translate(${ margin.left }, ${ margin.top })`);
	// TODO: check is it needed?
	const circles = g
    .selectAll('circle')
		.data([]);

		// X Axis
		const axisLeftCall = d3.axisBottom(scaleX)
			.tickValues([400, 4000, 40000])
			.tickFormat(d3.format('$'));
		g.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(${ 0 }, ${ height })`)
			.call(axisLeftCall);

		// Y Axis
		const axisBottomCall = d3.axisLeft(scaleY)
			.tickFormat(d => +d);
		g.append('g')
			.attr('class', 'y axis')
			.call(axisBottomCall);

    g.append('text')
      .attr('x', -height / 2)
      .attr('y', -margin.left / 2)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text('life expectancy');

    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom / 2)
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

		// exits
		circles.exit()
			// TODO: add animation here
			.remove();

		// enters circles
		circles
			.enter()
			.append('circle')
			.merge(circles)
			.attr('cx', d => scaleX(d.income))
			.attr('cy', d => scaleY(d.life_exp))
			// A/pi = r^2
			.attr('r', d => {
				// console.log(scaleRadius(d.population));
				return Math.sqrt(scaleRadius(d.population) / Math.PI)
				// return scaleRadius(d.population)
			})
			// .attr('height', d => (SVG_HEIGHT - GRAPH_MARGIN * 2) - scaleY(d.revenue))
			.attr('fill', '#007041');

		}, 500);
  }
