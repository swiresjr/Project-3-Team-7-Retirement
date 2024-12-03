// Initialize the map centered on the US
const map = L.map("us-map").setView([37.0902, -95.7129], 5); // Centered on the US

// Add the OpenStreetMap tile layer
const outdoors = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }
);
outdoors.addTo(map);

// Define a color gradient for the ranks
function getColor(rank) {
  const colorScale = d3
    .scaleSequential(d3.interpolateYlGnBu) // Yellow-Green-Blue gradient
    .domain([1, 50]); // Rank range from best to worst
  return colorScale(rank);
}

// Style each state based on its ranking
function style(feature) {
  const stateData = data.find((d) => d.State === feature.properties.name);
  return {
    fillColor: getColor(stateData ? parseInt(stateData.final_rank) : 51), // Default for missing data
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}

// Highlight feature on hover
function highlightFeature(e) {
  const layer = e.target;
  layer.setStyle({
    weight: 3,
    color: "#006400",
    fillOpacity: 0.9,
  });
  layer.bringToFront();
}
function updateWeatherChart(selectedState) {
  const stateData = parsedWeatherData.find(
    (data) => data.state === selectedState
  );

  if (!stateData) {
    console.error("Weather data not found for the state:", selectedState);
    return;
  }

  const xData = weatherMonths; // Months
  const yData = weatherMonths.map((month) => stateData[month]); // Corresponding temperatures

  const trace = {
    x: xData,
    y: yData,
    type: "bar",
    marker: {
      color: "#36A2EB",
    },
  };

  const layout = {
    title: `Monthly Average Temperatures for ${selectedState}`,
    xaxis: { title: "Month" },
    yaxis: { title: "Temperature (°F)" },
  };

  Plotly.newPlot("weather-plot", [trace], layout);
}

// Reset highlight on mouse out
function resetHighlight(e) {
  geojson.resetStyle(e.target);
}

// Function to update the state-graphs h1 element
function updateStateTitle(stateName) {
  const stateNameElement = document.getElementById("state-name");
  if (stateNameElement) {
    stateNameElement.textContent = ` ${stateName}`;
  } else {
    console.error("State name element not found.");
  }
}

// Function to generate a pie chart for the selected state

function generatePieChart(stateName, costData) {
  console.log("Generating chart for:", stateName, costData); // Debugging log

  const chartContainer = document.querySelector("#state-graphs");
  const existingCanvas = document.getElementById("costChart");

  // Remove existing chart if it exists
  if (existingCanvas) {
    existingCanvas.remove();
  }

  // Add a new canvas element
  const canvas = document.createElement("canvas");
  canvas.id = "costChart";
  chartContainer.appendChild(canvas);

  // Data preparation
  const labels = [
    "Housing",
    "Food",
    "Transportation",
    "Healthcare",
    "Other Necessities",
    "Childcare",
    "Taxes",
  ];
  const costs = [
    costData.housing_cost,
    costData.food_cost,
    costData.transportation_cost,
    costData.healthcare_cost,
    costData.other_necessities_cost,
    costData.childcare_cost,
    costData.taxes,
  ];

  // Filter out zero values
  const filteredData = costs
    .map((value, index) => ({ label: labels[index], value }))
    .filter((item) => item.value > 0);

  const filteredLabels = filteredData.map((item) => item.label);
  const filteredCosts = filteredData.map((item) => item.value);

  console.log("Filtered costs:", filteredCosts); // Debugging log

  // Generate the pie chart
  new Chart(canvas, {
    type: "pie",
    data: {
      labels: filteredLabels,
      datasets: [
        {
          label: `Cost Breakdown for ${stateName}`,
          data: filteredCosts,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#E57373",
          ],
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: `Cost Breakdown for ${stateName}`,
        },
        datalabels: {
          color: "#fff", // Set text color to white
          formatter: (value) => `$${value.toLocaleString()}`, // Format numbers as currency
          font: {
            weight: "bold",
            size: 14, // Adjust size for better visibility
          },
        },
      },
    },
    plugins: [ChartDataLabels], // Enable datalabels plugin
  });
}
// Function to generate a bar chart for the selected state
function generateBarChart(stateName, crimeData) {
  console.log("Generating crime chart for:", stateName, crimeData);

  const chartContainer = document.querySelector("#bar-chart-container");
  const existingCanvas = document.getElementById("crimeChart");

  // Clear existing canvas if present
  if (existingCanvas) {
    existingCanvas.remove();
  }

  // Add new canvas
  const canvas = document.createElement("canvas");
  canvas.id = "crimeChart";
  chartContainer.appendChild(canvas);

  const labels = crimeData.map((d) => d["Crime Type"]);
  const values = crimeData.map((d) => parseInt(d["Total Crimes"], 10));

  console.log("Crime labels:", labels);
  console.log("Crime values:", values);

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Crime Data for ${stateName}`,
          data: values,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `Crime Data for ${stateName}`,
          font: {
            size: 20, // Increase title font size
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Crime Types",
            font: {
              size: 14, // Increase x-axis label font size
            },
          },
          ticks: {
            font: {
              size: 12, // Increase x-axis tick font size
            },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Total Crimes",
            font: {
              size: 14, // Increase y-axis label font size
            },
          },
          ticks: {
            font: {
              size: 12, // Increase y-axis tick font size
            },
          },
        },
      },
    },
  });
}

// Add interaction for each feature
function onEachFeature(feature, layer) {
  const stateData = data.find((d) => d.State === feature.properties.name);

  const info = stateData
    ? `
      <strong>${stateData.State}</strong><br>
      General Ranking: ${stateData.final_rank || "N/A"}<br>
      Healthcare Rank: ${stateData.Rank_healthcare || "N/A"}<br>
      Food Cost Rank: ${stateData.Rank_food || "N/A"}<br>
      Housing Cost Rank: ${stateData.Rank_housing || "N/A"}<br>
      Crime Rates Rank: ${stateData.Rank_crime || "N/A"}
    `
    : "No data available";

  layer.on("mouseover", function (e) {
    highlightFeature(e);
    layer.bindPopup(info).openPopup();
  });

  layer.on("mouseout", function (e) {
    resetHighlight(e);
    layer.closePopup();
  });

  layer.on("click", function () {
    const stateName = feature.properties.name;
    console.log("State clicked:", stateName);

    updateStateTitle(stateName);

    updateWeatherChart(stateName);

    const stateCostData = data.find((d) => d.State === stateName);
    const stateCrimeData = crimeData.filter((d) => d.State === stateName);

    if (stateCostData) {
      const parseCost = (cost) =>
        cost && typeof cost === "string"
          ? parseFloat(cost.replace(/[$,]/g, ""))
          : 0;

      const costValues = {
        housing_cost: parseCost(stateCostData["Average Annual Housing Cost"]),
        food_cost: parseCost(stateCostData["Average Annual Food Cost"]),
        transportation_cost: parseCost(
          stateCostData["Average Annual Transportation Cost"]
        ),
        healthcare_cost: parseCost(stateCostData["Average Annual Premium"]),
        other_necessities_cost: parseCost(
          stateCostData["Average Annual Other Necessities Cost"]
        ),
        childcare_cost: parseCost(
          stateCostData["Average Annual Childcare Cost"]
        ),
        taxes: parseCost(stateCostData["Average Annual Taxes"]),
      };

      generatePieChart(stateName, costValues);
    } else {
      console.log("No cost data found for state:", stateName);
    }

    if (stateCrimeData.length > 0) {
      generateBarChart(stateName, stateCrimeData);
    } else {
      console.log("No crime data found for state:", stateName);
    }

    // Scroll to the state-graphs div
    const graphsDiv = document.getElementById("state-graphs-container");
    if (graphsDiv) {
      graphsDiv.scrollIntoView({ behavior: "smooth" });
    } else {
      console.error("State graphs div not found.");
    }
  });
}

// Fetch data from CSV and GeoJSON files
let data; // CSV data
let crimeData; // Crime data
let geojson; // GeoJSON data

// Load the CSV data
Promise.all([
  d3.csv("../Resources/master_data.csv"),
  d3.csv("../Resources/cost_of_living_us.csv"),
  d3.csv("../Resources/Crime_types_per_state.csv"),
  d3.json("us-states.json"),
]).then(([masterData, costData, crimeCsv, geojsonData]) => {
  data = masterData;
  costData = costData;
  crimeData = crimeCsv;

  geojson = L.geoJSON(geojsonData, {
    style: style,
    onEachFeature: onEachFeature,
  }).addTo(map);

  const defaultState = "Kentucky";
  const stateCostData = data.find((d) => d.State === defaultState);
  const stateCrimeData = crimeData.filter((d) => d.State === defaultState);

  updateStateTitle(defaultState);
  updateWeatherChart(defaultState);

  if (stateCostData) {
    const parseCost = (cost) =>
      cost && typeof cost === "string"
        ? parseFloat(cost.replace(/[$,]/g, ""))
        : 0;

    const costValues = {
      housing_cost: parseCost(stateCostData["Average Annual Housing Cost"]),
      food_cost: parseCost(stateCostData["Average Annual Food Cost"]),
      transportation_cost: parseCost(
        stateCostData["Average Annual Transportation Cost"]
      ),
      healthcare_cost: parseCost(stateCostData["Average Annual Premium"]),
      other_necessities_cost: parseCost(
        stateCostData["Average Annual Other Necessities Cost"]
      ),
      childcare_cost: parseCost(stateCostData["Average Annual Childcare Cost"]),
      taxes: parseCost(stateCostData["Average Annual Taxes"]),
    };

    generatePieChart(defaultState, costValues);
  }

  if (stateCrimeData.length > 0) {
    generateBarChart(defaultState, stateCrimeData);
  }
});

// Create a legend control
const legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  const div = L.DomUtil.create("div", "info legend");

  // Define the rank intervals and their corresponding colors
  const ranks = [1, 10, 20, 30, 40, 51]; // Adjust ranges as needed
  const labels = [];

  // Loop through the intervals and generate a label with a colored square for each interval
  for (let i = 0; i < ranks.length - 1; i++) {
    const color = d3.scaleSequential(d3.interpolateYlGnBu).domain([1, 50])(
      ranks[i]
    );

    labels.push(
      `<i style="background:${color}; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> 
      ${ranks[i]} - ${ranks[i + 1] - 1}`
    );
  }

  // Add the legend content
  div.innerHTML = `
    <h4>State Rankings</h4>
    ${labels.join("<br>")}
  `;

  return div;
};

// Add the legend to the map
legend.addTo(map);
