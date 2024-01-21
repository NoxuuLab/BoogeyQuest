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

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip") 
    .style("opacity", 0);

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
  var countryDropdown = d3.select("#countryDropdown");
  var attributeDropdown = d3.select("#attributeDropdown");
  var behaviorDropdown = d3.select("#behaviorDropdown");

  // Populate the country dropdown
  countryDropdown.selectAll("option")
    .data(Array.from(globalState.countries.keys()))
    .enter()
    .append("option")
    .text(function(d) { return d; })
    .attr("value", function(d) { return d; });

  // Initialize attribute and behavior dropdowns with dummy data for now
  attributeDropdown.append("option").text("Select an Attribute").attr("disabled", true).attr("selected", true);
  behaviorDropdown.append("option").text("Select a Behavior").attr("disabled", true).attr("selected", true);


    // Event listener for country dropdown changes
  countryDropdown.on("change", function(event) {
  // In D3 v6 and above, use 'event' instead of 'd3.event'
  var selectedCountry = event.target.value;
  globalState.selectedCountry = selectedCountry;
  updateUIForSelectedCountry(selectedCountry);
  populateAttributeAndBehaviorDropdowns(selectedCountry);
});

  // Populate attribute and behavior dropdowns based on the selected country
  attributeDropdown.on("change", onAttributeSelect);
  behaviorDropdown.on("change", onBehaviorSelect);
  // TODO: Populate attribute and behavior dropdowns based on the selected country
  // TODO: Add event listeners for attribute and behavior dropdown changes
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

// Function to populate attribute and behavior dropdowns based on the selected country
function populateAttributeAndBehaviorDropdowns(selectedCountry) {
  var attributeDropdown = d3.select("#attributeDropdown");
  var behaviorDropdown = d3.select("#behaviorDropdown");

  // Clear existing options
  attributeDropdown.selectAll("option").remove();
  behaviorDropdown.selectAll("option").remove();

  // Get the data for the selected country
  var countryData = globalState.countries.get(selectedCountry);
  if (countryData && countryData.Characteristics) {
      var attributes = countryData.Characteristics.PhysicalAppearance || [];
      var behaviors = countryData.Characteristics.Behavior || [];

      // Populate the attribute dropdown
      attributeDropdown.selectAll("option")
          .data(attributes)
          .enter()
          .append("option")
          .text(function(d) { return d; })
          .attr("value", function(d) { return d; });

      // Populate the behavior dropdown
      behaviorDropdown.selectAll("option")
          .data(behaviors)
          .enter()
          .append("option")
          .text(function(d) { return d; })
          .attr("value", function(d) { return d; });
  } else {
      // Handle case where no data is available
      attributeDropdown.append("option").text("No Attributes Available");
      behaviorDropdown.append("option").text("No Behaviors Available");
  }
}


// Function to handle attribute selection
function onAttributeSelect(event) {
  var selectedAttribute = event.target.value;
  globalState.selectedAttribute = selectedAttribute;

  // Update UI based on the selected attribute (and selected country/behavior if necessary)
  // For example, you might want to filter the map based on the selected attribute
}

// Function to handle behavior selection
function onBehaviorSelect(event) {
  var selectedBehavior = event.target.value;
  globalState.selectedBehavior = selectedBehavior;

  // Update UI based on the selected behavior (and selected country/attribute if necessary)
  // Similar to above, adjust the map or other UI elements based on the behavior
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

// Function to update the boogeyman card based on the provided data
function updateBoogeymanCard(boogeymanInfo) {
  if (!boogeymanInfo) {
    console.error("No boogeyman info provided to updateBoogeymanCard");
    return;
  }

  // Update the boogeyman card with the information from boogeymanInfo
  // For example, setting the name, description, image, etc.
  document.getElementById("boogeymanName").innerText = boogeymanInfo.Name;
  document.getElementById("boogeymanCountry").innerText = boogeymanInfo.Country;
  document.querySelector(".boogeyman-description").innerText = boogeymanInfo.Description;
  document.getElementById("boogeymanImage").style.backgroundImage = `url(${boogeymanInfo.Image})`;
}



// Call the loadData function when the page loads
loadData();