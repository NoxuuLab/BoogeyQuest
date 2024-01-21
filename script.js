var svg;

// Global SVG dimensions
var width = 960;  // Example width, adjust as needed
var height = 600; // Example height, adjust as needed

// Define global state
var globalState = {
  countries: new Map(), // To store the boogeyman data by country name
  geojson: null, // To store the geographic data for the map
  selectedCountry: null,
  selectedAttribute: null,
  selectedBehavior: null
};

// Define the projection and path for the map
var projection = d3.geoMercator()
  .center([0, 0]) // Center the Map in middle
  .scale(150)     // Scale the Map
  .translate([width / 2, height / 2]); // Translate to the center of the screen

var path = d3.geoPath().projection(projection);


// Function to load data
function loadData() {
  // Load boogeyman data
  d3.json('./data/boogeyman.json').then(function(boogeymanData) {
    // Store the boogeyman data in the global state for easy lookup by country
    boogeymanData.forEach(function(entry) {
      globalState.countries.set(entry.Country, entry);
    });

    // Now load the geojson data
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(function(loadedGeojson) {
      // Store the geojson data in the global state
      globalState.geojson = loadedGeojson;

      // With both datasets loaded, we can initialize the map and dropdowns
      createSVGContainer();
    });
  });
}

// Function to create the SVG element and define the 'svg' variable
function createSVGContainer() {
  var mapContainer = d3.select("#mapContainer");
  svg = mapContainer.append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

  // Initialize the map after creating the SVG container
  initializeMap();
  initializeDropdowns();
}
 
// Function to initialize the map with the geojson data
function initializeMap() {
  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(globalState.geojson.features)
    .enter()
    .append("path")
    .attr("d", path.projection(projection))
    .attr("class", function(d) {
      // Use a class to style the country
      return "country" + (globalState.countries.has(d.properties.name) ? " country-with-boogeyman" : "");
    })
    .on("mouseover", function(event, d) {
      // Show tooltip with country name (and boogeyman name if available)
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);

      const boogeymanInfo = globalState.countries.get(d.properties.name);
      if (boogeymanInfo) {
        // Call the updateBoogeymanCard function with the boogeymanInfo
        updateBoogeymanCard(boogeymanInfo);
      } else {
        tooltip.html(`<strong>${d.properties.name}</strong>`);
      }

      tooltip.style("left", (event.pageX) + "px").style("top", (event.pageY - 28) + "px");

      // Highlight country on mouseover only if not selected
      if (globalState.selectedCountry !== d.properties.name) {
        d3.select(this).classed("country-hover", true);
      }
    })
    .on("mouseleave", function(event, d) {
      // Hide tooltip on mouseout
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);

      // Reset country style on mouseout only if not selected
      if (globalState.selectedCountry !== d.properties.name) {
        d3.select(this).classed("country-hover", false);
      }
    })
    .on("click", function(event, d) {
      selectCountryFromMap(event, d);
    });
}

// Function to initialize the dropdown menus
function initializeDropdowns() {
  // Populate the country dropdown
  // Populate the attribute and behavior dropdowns based on the loaded boogeyman data
  // This is where you will reference globalState.countries
}

// Function to handle country selection from the map
function selectCountryFromMap(event, d) {
  const selectedValue = d.properties.name;

  // Update the global state with the selected country
  globalState.selectedCountry = selectedValue;

  // Update the UI based on the new state
  updateUIForSelectedCountry(selectedValue);
}

// Function to update UI when a country is selected
function updateUIForSelectedCountry(countryName) {
  // Highlight the selected country and update the boogeyman card
  svg.selectAll("path")
    .classed("selected-country", d => d.properties.name === countryName);

  const boogeymanInfo = globalState.countries.get(countryName);
  if (boogeymanInfo) {
    updateBoogeymanCard(boogeymanInfo);
  } else {
    // Update the boogeyman card for no information
    displayNoBoogeymanInfo(countryName);
  }
}

// Function to display boogeyman card with no information
function displayNoBoogeymanInfo(countryName) {
  // Set boogeyman card for no information available
  document.getElementById("boogeymanCard").style.display = "block";
  document.getElementById("boogeymanImage").style.backgroundImage = "none";
  document.getElementById("boogeymanName").innerText = "No Information Available";
  document.getElementById("boogeymanCountry").innerText = countryName;
  document.querySelector(".boogeyman-description").innerText = "Sorry, no information is available for this country.";
}

// Call the loadData function when the page loads
loadData();