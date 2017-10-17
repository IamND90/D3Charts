
//GLOBAL
let xValues;
let yValues;

var yMax, y1Max, yMin, y1Min;
let currentState = 'stacked';

const marginBars = {top: 80, right: 10, bottom: 20, left: 80};
let series;
let rect;



function dataRangeFor(data,cntr){
  let values = [];
  data.forEach(function(d) {
    if(d.country === cntr ){
      values.push(d.value);
    }
  });

  return values;
}

function calculateViewPort(max) {

  width = +svg.attr("width") - marginBars.left - marginBars.right;
  height = +svg.attr("height") - marginBars.top - marginBars.bottom;
  yValues = d3.scaleLinear()
      .domain([0, max])
      .range([height, 0]);
}

function createYAxis(type) {
  let maxOverAll =0;
  let maxInMonths = [];
  let xLabels = [];
  const widthLabel  = (+d3.select("#svgBars").attr("width") - marginBars.left -marginBars.right) /parsedData.m;
  const maxHeightLabel  = (+d3.select("#svgBars").attr("height") - marginBars.top );

  console.log('YAxis', parsedData.barData, parsedData.months);
  parsedData.months.forEach((m) => {
    let monthMax = 0;
    let totalInM =0;

    parsedData.barData.map(function(d){
      if(d.month == m) {
        totalInM += +d.value;
        if( d.value >= monthMax) monthMax = d.value;
      }
    });

    if( type === 'stacked'){
      if( totalInM >= maxOverAll) maxOverAll = totalInM;
      maxInMonths.push({value: totalInM, color: 'black'});
    }else {
      if( monthMax >= maxOverAll) maxOverAll = monthMax;
      maxInMonths.push({value: monthMax, color: 'blue' });
    }
  });

  console.log(maxInMonths);

  parsedData.months.forEach((m) => {

    let v = maxInMonths[m];
    let relToMaxY = v.value/maxOverAll;
    v.x = widthLabel*(m) + marginBars.left+10;
    v.y = maxHeightLabel *(1-relToMaxY) +60;
    v.month = MONTHS[m];
  });

  let texts = d3.select("#svgBars").selectAll("text");
  texts.remove();

  texts
  .data(maxInMonths)
  .enter()
  .append("text")
  .attr("x", function(d) { return d.x; })
  .attr("y", function(d) { return d.y; })
  .text( function (d) { return `${d.value.toFixed(1)} CHF`; })
  .attr("font-family", "sans-serif")
  .attr("font-size", "10px")
  .attr("fill", function (d) { return d.color; });

  texts
  .data(maxInMonths)
  .enter()
  .append("text")
  .attr("x", function(d) { return d.x; })
  .attr("y", function(d) { return height + marginBars.top  +15 })
  .text( function (d) { return d.month; })
  .attr("font-family", "sans-serif")
  .attr("font-size", "10px")
  .attr("fill", function (d) { return d.color; })
}

function createNames(svg){

  const ctr = [];
  let i =0;
  parsedData.countries.forEach((c) => {
    ctr.push({country: c, x: 20, y: 20*i, color: parsedData.colorMap(i) });
    i++;
  });
  console.log(ctr);
  svg.selectAll("text")
    .data(ctr)
    .enter()
    .append("text")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .text( function (d) { return d.country; })
    .attr("font-family", "sans-serif")
    .attr("color", function(d) { return d.color; })
    .attr("font-size", "10px");

}

function drawBars() {

    console.log('Draw Bars', parsedData);
    // The xz array has m elements, representing the x-values shared by all series.
    // The yz array has n elements, representing the y-values of each of the n series.
    // Each yz[i] is an array of m non-negative numbers representing a y-value for xz[i].
    // The y01z array has the same structure as yz, but with stacked [y₀, y₁] instead of y.
    let rangeY = d3.range(parsedData.n);
    let index = 0;
    let xz = d3.range(parsedData.m),
        yz = d3.range(parsedData.n).map(function(d) { return dataRangeFor(parsedData.barData,parsedData.countries[index++]); }),
        y01z = d3.stack().keys(d3.range(parsedData.n))(d3.transpose(yz));

    let stack = d3.stack().keys(rangeY)(d3.transpose(yz));

    svg = d3.select("#svgBars");
    svg.selectAll("*").remove();

    yMax = d3.max(yz, function(y1) { return d3.max(parsedData.rawValues); });
    y1Max = d3.max(y01z, function(y1) { return d3.max(y1, function(d) { return d[1]; }); });
    yMin = d3.min(yz, function(y1) { return d3.min(parsedData.rawValues); });
    y1Min = d3.min(y01z, function(y1) { return d3.min(y1, function(d) { return d[1]; }); });


    calculateViewPort(y1Max);
    createYAxis('stacked');
    createNames(svg);

    let g = svg.append("g").attr("transform", "translate(" + marginBars.left + "," + marginBars.top + ")");

    xValues = d3.scaleBand()
        .domain(xz)
        .rangeRound([0, width])
        .padding(0.08);

    series = g.selectAll(".series")
      .data(y01z)
      .enter().append("g")
        .attr("fill", function(d, i) { return parsedData.colorMap(i); });


    rect = series.selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d, i) { return xValues(i); })
        .attr("y", height)
        .attr("width", xValues.bandwidth())
        .attr("height", 0);

    rect.transition()
        .delay(function(d, i) { return i * 20; })
        .attr("y", function(d) { return yValues(d[1]); })
        .attr("height", function(d) { return yValues(d[0]) - yValues(d[1]); });

    d3.selectAll("input")
        .on("change", changed);

}



function transitionGrouped() {
  calculateViewPort(yMax);
  createYAxis('grouped');
  yValues.domain([0, yMax]);

  rect.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10; })
      .attr("x", function(d, i) { return xValues(i) + xValues.bandwidth() / parsedData.n * this.parentNode.__data__.key; })
      .attr("width", xValues.bandwidth() / parsedData.n)
    .transition()
      .attr("y", function(d) { return yValues(d[1] - d[0]); })
      .attr("height", function(d) { return yValues(0) - yValues(d[1] - d[0]); });
}

function transitionStacked() {
  calculateViewPort(y1Max);
  createYAxis('stacked');
  rect.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10; })
      .attr("y", function(d) { return yValues(d[1]); })
      .attr("height", function(d) { return yValues(d[0]) - yValues(d[1]); })
    .transition()
      .attr("x", function(d, i) { return xValues(i); })
      .attr("width", xValues.bandwidth());
}
