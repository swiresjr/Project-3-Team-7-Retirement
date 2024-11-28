// Initialize the map centered on the US
const map = L.map('us-map').setView([37.0902, -95.7129], 5); // Coordinates for the center of the US

// Add the OpenStreetMap tile layer
const outdoors = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
});
outdoors.addTo(map);

// Function to define color based on final_rank
function getColor(rank) {
    if (rank <= 10) return '#006400'; // dark green
    if (rank <= 20) return '#008000'; // green
    if (rank <= 30) return '#808080'; // grey
    if (rank <= 40) return '#FFA500'; // orange
    return '#FF0000'; // red
}

// Fetch the data from master_data.csv and plot on the map
d3.csv("master_data.csv").then(function(data) {
    // Function to style the states based on the final rank
    function style(feature) {
        const stateData = data.find(d => d.State === feature.properties.name);
        return {
            fillColor: getColor(stateData ? parseInt(stateData.final_rank) : 51),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    // Function to add markers when hovered over
    function onEachFeature(feature, layer) {
        const stateData = data.find(d => d.State === feature.properties.name);
        const info = stateData ? `
            <strong>${stateData.State}</strong><br>
            General Ranking: ${stateData.final_rank}<br>
            Healthcare Rank: ${stateData.Rank_healthcare}<br>
            Food Cost Rank: ${stateData.Rank_food}<br>
            Housing Cost Rank: ${stateData.Rank_housing}<br>
            Crime Rates Rank: ${stateData.Rank_crime}
        ` : 'No data available';

        layer.on('mouseover', function(e) {
            layer.bindPopup(info).openPopup();
        });
    }

    // Load the GeoJSON data for U.S. states from the added file
    d3.json("us-states.json").then(function(geojsonData) {
        L.geoJSON(geojsonData, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    });
});
