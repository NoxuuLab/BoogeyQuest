var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .center([0, 0])
  .scale(100)
  .translate([width / 2, height / 2]);

// Create a tooltip
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load boogeyman data from JSON file
d3.json('data/boogeyman.json').then(function (boogeymanData) {
  // Load world geojson
  d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(function (geojson) {
    // Create a map of countries with boogeyman information
    var countriesWithBoogeyman = boogeymanData.map(function (d) { return d.Country; });

    // Create a map for easy access to boogeyman information
    var boogeymanMap = new Map();
    boogeymanData.forEach(function (d) {
      boogeymanMap.set(d.Country, d);
    });

    // Draw the map
    svg.append("g")
      .selectAll("path")
      .data(geojson.features)
      .enter()
      .append("path")
        .attr("d", path.projection(projection))
        .attr("fill", function (d) {
          // Check if the country has boogeyman information
          if (countriesWithBoogeyman.includes(d.properties.name)) {
            const boogeymanInfo = boogeymanMap.get(d.properties.name);
            if (boogeymanInfo) {
              return "blue"; // Color for countries with boogeyman information
            }
          }
          return "lightgray"; // Default color for countries without boogeyman information
        })
        .style("stroke", "transparent")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", .8)
        .on("mouseover", function(event, d) {
          // Show tooltip with boogeyman name
          if (countriesWithBoogeyman.includes(d.properties.name)) {
            const boogeymanInfo = boogeymanMap.get(d.properties.name);
            if (boogeymanInfo) {
              tooltip.transition()
                .duration(200)
                .style("opacity", .9);
              tooltip.html(`<strong>${d.properties.name}</strong><br>${boogeymanInfo.Name}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
            }
          }

          // Highlight country on mouseover
          d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black");
        })
        .on("mouseleave", function(event, d) {
          // Hide tooltip on mouseout
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);

          // Reset country style on mouseout
          d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", .8)
            .style("stroke", "transparent");
        });
  });
});
