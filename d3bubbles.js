
var format = d3.format(",d");

var svgBubble = d3.select("#svgBubbles"),
    bubbleWidth = +svgBubble.attr("width"),
    bubbleHeight = +svgBubble.attr("height");

var pack = d3.pack()
    .size([bubbleWidth, bubbleHeight])
    .padding(1.5);


function drawBubbles() {

    var index =0;

    svgBubble.selectAll("*").remove();
    var data = [];

    parsedData.countries.forEach(function (c) {
      var tot = 0;
      var items =parsedData.barData.filter(function(item) {
        if( item.country == c){
          tot += item.value;
          return true;
        };
        return false;
      });
      var percent = `${(tot/parsedData.total*100).toFixed(1)}%`;

      data.push({
        id:c,
        value: tot,
        percent: percent,
      });
    });

    var root = d3.hierarchy({children: data})
        .sum(function(d) { return d.value; })
        .each(function(d) {
          if (id = d.data.id) {
            var id, i = id.lastIndexOf(".");
            d.id = id;
            d.index = index++;
            d.percent = d.data.percent;
            d.displayValue = `${d.data.value.toFixed(2)} CHF`;
            d.len = +id.length;
          }
        });


    var node = svgBubble.selectAll(".node")
      .data(pack(root).leaves())
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
        .attr("id", function(d) { return d.id; })
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return parsedData.colorMap(d.index); });


    node.append("text")
      .selectAll("tspan")
      .data(function(d) { return d.id.split(/(?=[A-Z][^A-Z])/g) })
      .enter().append("tspan")
        .attr("x", -30)
        .attr("y", -20)
        .attr("dy", ".35em")
        .text(function(d) { return d; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "#fff");

    node.append("text")
      .selectAll("tspan")
      .data(function(d) { return d.displayValue.split(/(?=[A-Z][^A-Z])/g) })
      .enter().append("tspan")
        .attr("x", -30)
        .attr("y", -20)
        .attr("dy", "1.8em")
        .text(function(d) { return d; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "15px")
        .attr("fill", "#fff");;
    node.append("text")
      .selectAll("tspan")
      .data(function(d) { return d.percent.split(/(?=[A-Z][^A-Z])/g) })
      .enter().append("tspan")
        .attr("x", -30)
        .attr("y", -15)
        .attr("dy", "2.5em")
        .text(function(d) { return d; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "#fff");;

    node.append("title")
        .text(function(d) { return d.percent + "\n" + format(d.value); });

}
