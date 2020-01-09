/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const chartContainer = document.querySelector('#chart-area');
const svg = d3.select(chartContainer).append('svg');
const margin = { left: 70, right: 50, top: 50, bottom: 70 };
let incomeExtent = null;
let lifeExpExtent = null;
let populationExtent = null;

main();

async function main() {
	const data = await loadData();

	// calculate extents
	const allYearCountries = data.reduce((all, item) => all.concat(item.countries), []);
	incomeExtent = d3.extent(allYearCountries, c => c.income);
	lifeExpExtent = d3.extent(allYearCountries, c => c.life_exp);
	populationExtent = d3.extent(allYearCountries, c => c.population);

	resizeGraph();
	showGraph(svg, data);

	window.addEventListener('resize', () => resizeGraph());
}

async function loadData() {
  const data = await d3.json('data/data.json');
  return data.map(({countries, year}) => ({
		year: +year,
		// remove countries w/o data
    countries: countries.filter(c => c.income && c.life_exp),
  }));
}

function getSize() {
	const {width} = chartContainer.getBoundingClientRect();
	return {
		width,
		height: Math.round(width * .6),
	};
}

function resizeGraph() {
	const size = getSize();
  svg
		.attr('width', size.width + margin.left + margin.right)
		.attr('height', size.height + margin.top + margin.bottom);
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

	const size = getSize();
	const width = size.width - margin.left - margin.right;
	const height = size.height - margin.top - margin.bottom;

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
	const continentScale = d3.scaleOrdinal(d3.schemeCategory10)
		// .domain(Array.from(new Set(data[0].countries.map(c => c.continent))));
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

		const year = g.append('text')
			// .classed('year-text', true)
			.attr('x', width)
			.attr('y', height - 10)
			.attr('font-size', '30')
			.attr('text-anchor', 'end')
			.text(data[0].year);

		d3.interval(() => {
			// update data index
			index ++;
			if (index >= data.length) {
				index = 0;
			}

			// update year label
			year.text(data[index].year);

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
					.attr('r', d => Math.sqrt(scaleRadius(d.population) / Math.PI))
				.attr('fill', d => continentScale(d.continent));

		}, 500);
  }
