var svg;

// Global SVG dimensions
var width = 960;  
var height = 600;

// Define global state
var globalState = {
  countries: new Map(), // Store the boogeyman data by country name
  geojson: null, // Sstore the geographic data for the map
  selectedCountry: null,
  selectedAttribute: null,
  selectedBehavior: null
};

// Tooltip declaration
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip") 
    .style("opacity", 0);

// Define the projection and path for the map
var projection = d3.geoMercator()
  .center([0, 0]) // You might need to adjust this or remove it
  .scale(150) // And this value as well
  .translate([width / 2, height / 2]);
var path = d3.geoPath().projection(projection);

// Function to load data
function loadData() {
  // Load boogeyman data
  d3.json('./data/boogeyman.json').then(function(boogeymanData) {
    // Store the boogeyman data in the global state for lookup by country
    let allAttributes = new Set();
    let allBehaviors = new Set();

    boogeymanData.forEach(function(entry) {
      globalState.countries.set(entry.Country, entry);
      
      if (entry.Characteristics) {
        entry.Characteristics.PhysicalAppearance.forEach(attr => allAttributes.add(attr));
        entry.Characteristics.Behavior.forEach(behav => allBehaviors.add(behav));
      }
    });

    // Convert Sets to Arrays for d3 data binding
    globalState.allAttributes = Array.from(allAttributes);
    globalState.allBehaviors = Array.from(allBehaviors);

    // Populate attribute and behavior dropdowns
    populateAttributeAndBehaviorDropdowns();

    // Load the geojson data
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson').then(function(loadedGeojson) {
      // Store the geojson data in the global state
      globalState.geojson = loadedGeojson;

      // Initialize the map
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

  // Initialize the map and dropdown menus after creating the SVG container
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
      return "country" + (globalState.countries.has(d.properties.name) ? " country-with-boogeyman" : "");
    })
    .on("mouseover", function(event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
    
      const boogeymanInfo = globalState.countries.get(d.properties.name);
      let tooltipText = boogeymanInfo ? boogeymanInfo.Name : d.properties.name;
      tooltip.html(`<strong>${tooltipText}</strong>`);
    
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px");
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

    // Initialize attribute and behavior dropdown
    attributeDropdown.append("option").text("Select an Attribute").attr("disabled", true).attr("selected", true);
    behaviorDropdown.append("option").text("Select a Behavior").attr("disabled", true).attr("selected", true);


    // Event listener for country dropdown changes
    countryDropdown.on("change", function(event) {
      var selectedCountry = event.target.value;
      globalState.selectedCountry = selectedCountry;
      updateUIForSelectedCountry(selectedCountry);
    });
    
  attributeDropdown.on("change", onAttributeSelect);
  behaviorDropdown.on("change", onBehaviorSelect);
  
}

// Function to handle country selection from the map
function selectCountryFromMap(event, d) {
  const selectedValue = d.properties.name;

  // Update the global state with the selected country
  globalState.selectedCountry = selectedValue;

  // Update the UI based on the new state
  updateUIForSelectedCountry(selectedValue);

  // Update the country dropdown
  updateDropdownSelection(selectedValue);
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
function populateAttributeAndBehaviorDropdowns() {
  var attributeDropdown = d3.select("#attributeDropdown");
  var behaviorDropdown = d3.select("#behaviorDropdown");

  // Clear existing options
  attributeDropdown.selectAll("option").remove();
  behaviorDropdown.selectAll("option").remove();

  // Add default options
  attributeDropdown.append("option").text("Select an Attribute").attr("disabled", true).attr("selected", true);
  behaviorDropdown.append("option").text("Select a Behavior").attr("disabled", true).attr("selected", true);

  // Populate the attribute dropdown
  attributeDropdown.selectAll("option")
    .data(globalState.allAttributes)
    .enter()
    .append("option")
    .text(function(d) { return d; })
    .attr("value", function(d) { return d; });

  // Populate the behavior dropdown
  behaviorDropdown.selectAll("option")
    .data(globalState.allBehaviors)
    .enter()
    .append("option")
    .text(function(d) { return d; })
    .attr("value", function(d) { return d; });
}

// Function to handle bahaviour selection
function onBehaviorSelect(event) {
  var selectedBehavior = event.target.value;
  globalState.selectedBehavior = selectedBehavior;
  globalState.selectedCountry = null;
  globalState.selectedAttribute = null;

  // Clear country and attribute dropdowns
  var countryDropdown = d3.select("#countryDropdown").node();
  var attributeDropdown = d3.select("#attributeDropdown").node();

  countryDropdown.selectedIndex = 0;
  attributeDropdown.selectedIndex = 0;

  // Clear any previous highlights on the map
  clearMapHighlights();

  // Highlight countries based on the selected behavior
  updateMapForBehavior(selectedBehavior);
}

// Function to update the map based on the behavior selection
function updateMapForBehavior(behavior) {
  svg.selectAll("path")
    .classed("highlighted", function(d) {
      const countryData = globalState.countries.get(d.properties.name);
      return countryData && countryData.Characteristics 
             && countryData.Characteristics.Behavior 
             && countryData.Characteristics.Behavior.includes(behavior);
    });
}

// Function to handle attribute selection
function onAttributeSelect(event) {
  var selectedAttribute = event.target.value;
  globalState.selectedAttribute = selectedAttribute;
  globalState.selectedCountry = null;
  globalState.selectedBehavior = null;

  // Clear country and behavior dropdowns
  var countryDropdown = d3.select("#countryDropdown").node();
  var behaviorDropdown = d3.select("#behaviorDropdown").node();

  countryDropdown.selectedIndex = 0; // Reset to the first option, assuming it's a placeholder like "Select a Country"
  behaviorDropdown.selectedIndex = 0; // Reset to the first option, assuming it's a placeholder like "Select a Behavior"

  // Clear any previous highlights on the map
  clearMapHighlights();

  // Highlight countries based on the selected attribute
  updateMapForAttribute(selectedAttribute);
}

// Function to update the map based on the attribute selection
function updateMapForAttribute(attribute) {
  svg.selectAll("path")
    .classed("highlighted", function(d) {
      const countryData = globalState.countries.get(d.properties.name);
      return countryData && countryData.Characteristics 
             && countryData.Characteristics.PhysicalAppearance 
             && countryData.Characteristics.PhysicalAppearance.includes(attribute);
    });
}

// Function to clear the hightlights on the map based
function clearMapHighlights() {
  svg.selectAll("path.highlighted").classed("highlighted", false);
}

// Update country dropdown
function updateDropdownSelection(selectedCountryName) {
  var countryDropdown = d3.select("#countryDropdown");
  countryDropdown.property("value", selectedCountryName);

  // Reset attribute and behavior dropdowns
  d3.select("#attributeDropdown").property("value", "Select an Attribute");
  d3.select("#behaviorDropdown").property("value", "Select a Behavior");
}
// Function to display boogeyman card with no information
function displayNoBoogeymanInfo(countryName) {
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
  document.getElementById("boogeymanName").innerText = boogeymanInfo.Name;
  document.getElementById("boogeymanCountry").innerText = boogeymanInfo.Country;
  document.querySelector(".boogeyman-description").innerText = boogeymanInfo.Description;
  document.getElementById("boogeymanImage").style.backgroundImage = `url(${boogeymanInfo.Image})`;
}

// loadData function when the page loads
loadData();