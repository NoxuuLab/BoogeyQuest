// D3-related variables
var mapContainer = d3.select("#mapContainer");
var svg = mapContainer.append("svg").attr("width", "100%").attr("height", "100%");
var width = mapContainer.node().getBoundingClientRect().width;
var height = mapContainer.node().getBoundingClientRect().height;
var path = d3.geoPath();
var projection = d3.geoMercator().center([0, 0]).scale(100).translate([width / 2, height / 2]);
var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
var zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);
var selectedCountry = null;
var countriesWithBoogeyman;
var geojson;
var boogeymanMap;

// Apply zoom behavior to the SVG
svg.call(zoom);

// Function to handle zooming
function zoomed(event) {
    svg.selectAll('path')
      .attr("transform", event.transform);
  }

// Function to update the boogeyman card
function updateBoogeymanCard(boogeymanInfo) {
  console.log("Updating boogeyman card:", boogeymanInfo);
  // Update the card content based on the boogeyman information
  document.getElementById("boogeymanImage").style.backgroundImage = `url(${boogeymanInfo.Image})`;
  document.getElementById("boogeymanName").innerText = boogeymanInfo.Name;
  document.getElementById("boogeymanCountry").innerText = boogeymanInfo.Country;
  document.querySelector(".boogeyman-description").innerText = boogeymanInfo.Description;

  // Show the boogeyman card
  document.getElementById("boogeymanCard").style.display = "block";
}

// Function to update the boogeyman dropdown menu
function updateBoogeymanDropdown(countriesWithBoogeyman) {
  var dropdown = d3.select("#countryDropdown");

  // Remove existing options
  dropdown.selectAll("option").remove();

  // Add default option
  dropdown.append("option")
    .text("Select a Country")
    .attr("disabled", true)
    .attr("selected", true);

  // Add options for each country
  geojson.features.forEach(function (feature) {
    var countryName = feature.properties.name;

    var option = dropdown.append("option")
      .text(countryName)
      .attr("value", countryName);

  });
}

// Function to update the map based on the selected country
function updateMap(selectedValue) {
  // Highlight the selected country in the map
  svg.selectAll('path')
    .classed("selected", function (d) {
      return d.properties.name === selectedValue;
    });
}

// ...

// Function to handle country selection from the map
function selectCountryFromMap(event, d) {
  var selectedValue = d.properties.name;

  console.log("Selected country from map:", selectedValue);

  // Update the selected country variable
  selectedCountry = selectedValue;

  // Reset the stroke and opacity for all countries
  svg.selectAll('path')
    .classed("selected", function (d) {
      return d.properties.name === selectedValue;
    })
    .transition()
    .duration(200)
    .style("opacity", 0.8)
    .style("stroke", "transparent");

  // Update the dropdown selection
  d3.select("#countryDropdown")
    .property("value", selectedValue);

  // Call the function to update the map based on the selected country
  updateMap(selectedValue);

  // Check if the selected country has boogeyman information
  if (countriesWithBoogeyman.includes(selectedValue)) {
    // Use a callback to ensure the boogeyman data is loaded
    loadBoogeymanInfo(selectedValue, function (boogeymanInfo) {
      // Call the updateBoogeymanCard function with the boogeymanInfo
      updateBoogeymanCard(boogeymanInfo);
    });
  } else {
    // Show a message in the boogeyman card
    document.getElementById("boogeymanCard").style.display = "block";
    document.getElementById("boogeymanImage").style.backgroundImage = "none"; // Remove background image
    document.getElementById("boogeymanName").innerText = "No Information Available";
    document.getElementById("boogeymanCountry").innerText = selectedValue;
    document.querySelector(".boogeyman-description").innerText = "Sorry, no information is available for this country.";
  }

  // Show tooltip with country name
  tooltip.transition()
    .duration(200)
    .style("opacity", .9);
  tooltip.html(`<strong>${selectedValue}</strong>`);
}

// Function to load boogeyman information with a callback
function loadBoogeymanInfo(country, callback) {
  // Check if the boogeyman data is loaded
  if (boogeymanMap && boogeymanMap.has(country)) {
    // Boogeyman data is available, call the callback
    callback(boogeymanMap.get(country));
  } else {
    // Boogeyman data is not available, load it asynchronously
    d3.json('data/boogeyman.json').then(function (boogeymanData) {
      // Update boogeymanMap with the loaded data
      boogeymanMap = new Map(boogeymanData.map(entry => [entry.Country, entry]));

      // Call the callback with the boogeymanInfo
      callback(boogeymanMap.get(country));
    });
  }
}


// Function to handle country selection from the dropdown menu
function selectCountry() {
  var selectedValue = d3.select("#countryDropdown").property("value");

  // Check if a country is selected
  if (selectedValue !== "Select a Country") {
    // Reset the selected country variable
    selectedCountry = null;

    // Reset the stroke and opacity for all countries
    svg.selectAll('path')
      .classed("selected", false)
      .transition()
      .duration(200)
      .style("opacity", 0.8)
      .style("stroke", "transparent");

    // Highlight the selected country in the dropdown menu
    d3.select("#countryDropdown option[value='" + selectedValue + "']")
      .attr("selected", true);

    // Check if the selected country has boogeyman information
    if (countriesWithBoogeyman.includes(selectedValue)) {
      const boogeymanInfo = boogeymanMap.get(selectedValue);
      if (boogeymanInfo) {
        // Log boogeymanInfo to the console to check if it's retrieved correctly
        console.log("Boogeyman Info:", boogeymanInfo);

        // Call the updateBoogeymanCard function with the boogeymanInfo
        updateBoogeymanCard(boogeymanInfo);
      }
    } else {
      // Show a message in the boogeyman card
      document.getElementById("boogeymanCard").style.display = "block";
      document.getElementById("boogeymanImage").style.backgroundImage = "none"; // Remove background image
      document.getElementById("boogeymanName").innerText = "No Information Available";
      document.getElementById("boogeymanCountry").innerText = selectedValue;
      document.querySelector(".boogeyman-description").innerText = "Sorry, no information is available for this country.";
    }

    // Show tooltip with country name
    tooltip.transition()
      .duration(200)
      .style("opacity", .9);
    tooltip.html(`<strong>${selectedValue}</strong>`);

    // Call the function to update the map based on the selected country
    updateMap(selectedValue);

    // Update the dropdown menu with the selected value
    d3.select("#countryDropdown").property("value", selectedValue);
  }
}
// Function to load data and initialize the map
function loadData() {
  d3.json('data/boogeyman.json').then(function (boogeymanData) {
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(function (loadedGeojson) {
      geojson = loadedGeojson;
      countriesWithBoogeyman = boogeymanData.map(function (d) { return d.Country; });
      boogeymanMap = new Map();
      boogeymanData.forEach(function (d) {
        boogeymanMap.set(d.Country, d);
      });
      updateBoogeymanDropdown(countriesWithBoogeyman);
      drawMap();
    });
  });
}

// Function to draw the map
function drawMap() {
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
    .attr("class", function (d) { return "Country" })
    .style("opacity", .8)
    // Update the mouseover event handler
    .on("mouseover", function (event, d) {
      // Show tooltip with country name (and boogeyman name if available)
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);

      if (countriesWithBoogeyman.includes(d.properties.name)) {
        const boogeymanInfo = boogeymanMap.get(d.properties.name);
        if (boogeymanInfo) {
          // Call the updateBoogeymanCard function with the boogeymanInfo
          updateBoogeymanCard(boogeymanInfo);
        }
      } else {
        tooltip.html(`<strong>${d.properties.name}</strong>`);
      }

      tooltip.style("left", (event.pageX) + "px").style("top", (event.pageY - 28) + "px");

      // Highlight country on mouseover only if not selected
      if (selectedCountry !== d.properties.name) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "black");
      }
    })
    // Update the mouseleave event handler
    .on("mouseleave", function (event, d) {
      // Hide tooltip on mouseout
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);

      // Reset country style on mouseout only if not selected
      if (selectedCountry !== d.properties.name) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", .8)
          .style("stroke", "transparent");
      }
    })
    // Update the click event handler
    .on("click", function (event, d) {
      console.log("Click event triggered");
      // Reset the stroke and opacity for unselected countries
      svg.selectAll('path:not(.selected)')
        .transition()
        .duration(200)
        .style("opacity", 0.8)
        .style("stroke", "transparent");

      // Set the selected country
      selectedCountry = d.properties.name;
      selectCountryFromMap(event, d);

      // Highlight the selected country
      d3.select(this)
        .classed("selected", true)  // Add a class to mark the selected country
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black");

      // Check if the clicked country has boogeyman information
      if (countriesWithBoogeyman.includes(selectedCountry)) {
        const boogeymanInfo = boogeymanMap.get(selectedCountry);
        if (boogeymanInfo) {
          // Call the updateBoogeymanCard function with the boogeymanInfo
          updateBoogeymanCard(boogeymanInfo);
        }
      } else {
        // Show a message in the boogeyman card
        document.getElementById("boogeymanCard").style.display = "block";
        document.getElementById("boogeymanImage").style.backgroundImage = "none"; // Remove background image
        document.getElementById("boogeymanName").innerText = "No Information Available";
        document.getElementById("boogeymanCountry").innerText = selectedCountry;
        document.querySelector(".boogeyman-description").innerText = "Sorry, no information is available for this country.";
      }

      // Show tooltip with country name
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`<strong>${selectedCountry}</strong>`);
      tooltip.style("left", (event.pageX) + "px").style("top", (event.pageY - 28) + "px");

      // Disable hover effects by preventing mouseover and mouseleave events
      svg.selectAll('path')
        .on("mouseover", null)
        .on("mouseleave", null);
    });
}

// Call the function to load data and initialize the map
loadData();
