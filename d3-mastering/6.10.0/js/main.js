/*
*    main.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/

var formatSi = d3.format(".2s");
function formatAbbreviation(x) {
    var s = formatSi(x);
    switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
    }
    return s;
}
var formatTime = d3.timeFormat("%d/%m/%Y");

var margin = { left:80, right:100, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom,
    width = 800 - margin.left - margin.right;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const coinSelectElement = document.querySelector('#coin-select');
const varSelectElement = document.querySelector('#var-select');
let selectedSeries = 'bitcoin';
let selectedValueType = 'price_usd';
let selectedMinDate = 0;
let selectedMaxDate = 0;

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left +
        ", " + margin.top + ")");

// Time parser for x-scale
var parseTime = d3.timeParse("%d/%m/%Y")
// For tooltip
var bisectDate = d3.bisector(function(d) { return d.date; }).left;

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Axis generators
var xAxisCall = d3.axisBottom()
var yAxisCall = d3.axisLeft()
    .ticks(6)
    .tickFormat(formatAbbreviation);
    // .tickFormat(function(d) { return parseInt(d / 1000) + "k"; });

// Axis groups
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis = g.append("g")
    .attr("class", "y axis")

// Y-Axis label
const yAxisLabel = yAxis.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text(varSelectElement.options[varSelectElement.selectedIndex].text);

// Line path generator
var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d[selectedValueType]); });

d3.json("data/coins.json").then(function(data) {
    // Data cleaning
    Object.values(data).forEach(series => series.forEach(item => {
        item.date = parseTime(item.date).getTime();
        item['24h_vol'] = +item['24h_vol'] || 0;
        item.market_cap = +item.market_cap || 0;
        item.price_usd = +item.price_usd || 0;
    }));

    const dateMin = d3.min(data[selectedSeries], d => d.date);
    const dateMax = d3.max(data[selectedSeries], d => d.date);
    selectedMinDate = dateMin;
    selectedMaxDate = dateMax;


    // Add line to chart
    const linePath  = g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-with", "3px");
        // .attr("d", line(selectedSeries));

    update();

    function update() {
        const selectedData = data[selectedSeries]
            .filter(d => d.date >= selectedMinDate && d.date <= selectedMaxDate);

        // Set scale domains
        const yMin = d3.min(selectedData, function(d) { return d[selectedValueType]; });
        const yMax = d3.max(selectedData, function(d) { return d[selectedValueType]; });
        x.domain(d3.extent(selectedData, function(d) { return d.date; }));
        y.domain([yMin / 1.005, yMax * 1.005]);

        // Generate axes once scales have been set
        xAxis.transition().call(xAxisCall.scale(x))
        yAxis.transition().call(yAxisCall.scale(y))

        linePath
            .transition()
            .attr("d", line(selectedData));
    }

    // <UI Update>
    coinSelectElement.addEventListener('change', ({currentTarget}) => {
        selectedSeries = currentTarget.value;
        update();
    });

    varSelectElement.addEventListener('change', ({currentTarget}) => {
        selectedValueType = currentTarget.value;
        update();
        yAxisLabel.text(currentTarget.options[currentTarget.selectedIndex].text);
    });

    $("#date-slider" ).slider({
        range: true,
        min: dateMin,
        max: dateMax,
        values: [dateMin, dateMax],
        slide: (_, {values}) => {
            selectedMinDate = values[0];
            selectedMaxDate = values[1];
            update();
            $("#dateLabel1").text(formatTime(new Date(selectedMinDate)));
            $("#dateLabel2").text(formatTime(new Date(selectedMaxDate)));
        },
    });
    // $( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
    //   " - $" + $( "#slider-range" ).slider( "values", 1 ) );
    // </UI Update>

    /******************************** Tooltip Code ********************************/

    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 7.5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    g.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        const selectedData = data[selectedSeries]
            .filter(d => d.date >= selectedMinDate && d.date <= selectedMaxDate);

        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(selectedData, x0, 1),
            d0 = selectedData[i - 1],
            d1 = selectedData[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d[selectedValueType]) + ")");
        focus.select("text").text(d[selectedValueType]);
        focus.select(".x-hover-line").attr("y2", height - y(d[selectedValueType]));
        focus.select(".y-hover-line").attr("x2", -x(d.date));
    }

    /******************************** Tooltip Code ********************************/

});

