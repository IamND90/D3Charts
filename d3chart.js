
function drawChart() {
  var svg = d3.select("#svgChart"),
      g = svg.append("g").attr("transform", "translate(" + marginBars.left + "," + 0 + ")");
  var widthC = +svg.attr("width") - marginBars.left - marginBars.right;
  var heightC = +svg.attr("height") - marginBars.top - marginBars.bottom;

  var x = d3.scaleTime()
      .rangeRound([0, widthC]);

  var y = d3.scaleLinear()
      .rangeRound([heightC, 0]);
    var keys = Object.keys(parsedData.chartData[0]);
    var absMax = d3.max(parsedData.chartData, function(d) {
      return d3.max([d.value, d.billed,d.max,d.min]);
    });
    var absMin = d3.min(parsedData.chartData, function(d) {
      return d3.min([d.value, d.billed,d.max,d.min]);
    });

    console.log('MaxMin Domain', absMin, absMax);
    y.domain([absMin, absMax]);
    x.domain(d3.extent(parsedData.chartData, function(d) { return d.date; }));

    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate("+marginBars.left +"," + heightC + ")")
      .call(d3.axisBottom(x)
              .tickFormat(d3.timeFormat("%y-%m-%d")))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    g.append("g")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("CHF");


    //  key[0] is date
    //  key[1+] ar chartvalues
    var chartLines = [];
    for ( let i = 1; i < keys.length ; i++ ) {
      var key = keys[i];
      let chartData = parsedData.chartData.map(function(d) {
        return ({date: d.date, value: d[key]});
      });

      var max = d3.max(chartData, function(d) {
        return d.value;
      });
      var min = d3.min(chartData, function(d) {
        return d.value;
      });

      console.log('Before', chartData);
      // Scale the range of the data

      var relData = chartData.map((d) => {
        var c = (max-min)/(absMax-absMin)* d.value + min;
        return {date: d.date, value: c};
      });
      console.log('After', relData);
      var line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

      //x.domain(d3.extent(chartData, function(d) { return d.date; }));
      y.domain(d3.extent(chartData, function(d) { return d.value; }));

      g.append("path")
          .datum(relData)
          .attr("fill", "none")
          .attr("stroke", function() { return parsedData.colorMap(i-1); })
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("d", line);

      g.append("text")
      .text( function (d) { return key; })
      .attr("x", 20)
      .attr("y", () => {return 50+ 18*i;})
      .attr("font-family", "sans-serif")
      .attr("font-size", "18px")
      .attr("fill", function (d) { return parsedData.colorMap(i-1); });
    }


}
