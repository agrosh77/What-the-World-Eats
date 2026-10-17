
/* =====================================================
   MAP 3: FOODS ON THE MOVE
   Interactive historical food distribution map

   Step 1: Initialize the Leaflet map
   ===================================================== */

// Create the map inside the HTML element with id="map3-map"
const map3 = L.map('map3-map', {
    worldCopyJump: true,
    scrollWheelZoom: false
}).setView([15, 0], 2);

// Add a world basemap
L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 17
    }
).addTo(map3);

// Ensure the map fits its container correctly
setTimeout(() => {
    map3.invalidateSize();
}, 200);


/* =====================================================
   MAP 3: POTATO DISTRIBUTION
   Shade countries using Kew botanical distribution data
   ===================================================== */

// Colors for the two distribution categories
const map3Colors = {
    native: '#719C65',       // Green
    introduced: '#AA7AB1'   // Purple
};


/* =====================================================
   MAP 3: INTERACTIVE FOOD DISTRIBUTION
   Load all six foods and update the map when selected
   ===================================================== */

// Store the GeoJSON layer so we can replace it
let map3DistributionLayer = null;

// Food names for the changing legend
const map3FoodNames = {
    potato: 'Potato',
    tomato: 'Tomato',
    cacao: 'Cacao',
    coffee: 'Coffee',
    apple: 'Apple',
    corn: 'Corn'
};

// Store the loaded data
let map3DistributionRows = [];
let map3WorldGeoJSON = null;

// Display the selected food's distribution
function showMap3Food(foodId) {

    // Match country codes to native/introduced status
    const foodCountries = {};

    map3DistributionRows.forEach(row => {
        if (row.food_id === foodId && row.iso_a3) {
            foodCountries[row.iso_a3.trim().toUpperCase()] =
                row.distribution_status.trim();
        }
    });

    // Remove the previous food's colored countries
    if (map3DistributionLayer) {
        map3.removeLayer(map3DistributionLayer);
    }

    // Add the selected food's colored countries
    map3DistributionLayer = L.geoJSON(map3WorldGeoJSON, {

        style: feature => {
            const countryCode = feature.properties.iso_a3;
            const status = foodCountries[countryCode];

            let fillColor = '#F4EBD8';

            if (status === 'Native') {
                fillColor = map3Colors.native;
            } else if (status === 'Introduced') {
                fillColor = map3Colors.introduced;
            }

            return {
                color: '#6B746F',
                weight: 0.6,
                fillColor: fillColor,
                fillOpacity: status ? 0.7 : 0.08
            };
        },

        onEachFeature: (feature, layer) => {
            const countryCode = feature.properties.iso_a3;
            const status = foodCountries[countryCode];

            if (status) {
                const countryName =
                    feature.properties.ADMIN ||
                    feature.properties.name ||
                    countryCode;

                layer.bindPopup(
                    `<strong>${countryName}</strong><br>` +
                    `${map3FoodNames[foodId]} distribution: ${status}<br>` +
                    `<small>Source: Royal Botanic Gardens, Kew</small>`
                );
            }
        }

    }).addTo(map3);

    // Update the legend heading
    document.getElementById('map3-legend-title').textContent =
        map3FoodNames[foodId] + ' Distribution';

    // Highlight the selected food button
    document.querySelectorAll('.map3-food-btn').forEach(button => {
        const isSelected = button.dataset.food === foodId;

        button.classList.toggle('active', isSelected);
        button.setAttribute('aria-pressed', String(isSelected));
    });
}

// Load the distribution CSV and world boundaries once
Promise.all([
    fetch('Data/map3_distribution_country_codes.csv')
        .then(response => {
            if (!response.ok) throw new Error('Could not load Map 3 CSV');
            return response.text();
        }),

    fetch('Data/world-countries.geojson')
        .then(response => {
            if (!response.ok) throw new Error('Could not load world GeoJSON');
            return response.json();
        })
])
.then(([csvText, worldGeoJSON]) => {

    map3DistributionRows = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
    }).data;

    map3WorldGeoJSON = worldGeoJSON;

    // Display potatoes when the page first loads
    showMap3Food('potato');

    // Connect the food buttons to the map
    document.querySelectorAll('.map3-food-btn').forEach(button => {
        button.addEventListener('click', () => {
            showMap3Food(button.dataset.food);
        });
    });

    console.log('Map 3 food selection ready!');
})
.catch(error => {
    console.error('Map 3 distribution error:', error);
});

    fetch('Data/map3_distribution_country_codes.csv')
        .then(response => {
            if (!response.ok) throw new Error('Could not load Map 3 CSV');
            return response.text();
        }),

    fetch('Data/world-countries.geojson')
        .then(response => {
            if (!response.ok) throw new Error('Could not load world GeoJSON');
            return response.json();
        })
])
.then(([csvText, worldGeoJSON]) => {

    // Read CSV rows using Papa Parse (already loaded in index.html)
    const distributionRows = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
    }).data;

    // Look up the potato distribution status by country code
    const potatoCountries = {};

    distributionRows.forEach(row => {
        if (row.food_id === 'potato' && row.iso_a3) {
            potatoCountries[row.iso_a3.trim().toUpperCase()] =
                row.distribution_status.trim();
        }
    });

    // Draw country boundaries with distribution colors
    L.geoJSON(worldGeoJSON, {

        style: feature => {
            const countryCode = feature.properties.iso_a3;
            const status = potatoCountries[countryCode];

            let fillColor = '#F4EBD8'; // No recorded distribution

            if (status === 'Native') {
                fillColor = map3Colors.native;
            } else if (status === 'Introduced') {
                fillColor = map3Colors.introduced;
            }

            return {
                color: '#6B746F',
                weight: 0.6,
                fillColor: fillColor,
                fillOpacity: status ? 0.7 : 0.08
            };
        },

        onEachFeature: (feature, layer) => {
            const countryCode = feature.properties.iso_a3;
            const status = potatoCountries[countryCode];

            // Only show popups for countries in the dataset
            if (status) {
                const countryName =
                    feature.properties.ADMIN ||
                    feature.properties.name ||
                    countryCode;

                layer.bindPopup(
                    `<strong>${countryName}</strong><br>` +
                    `Potato distribution: ${status}<br>` +
                    `<small>Source: Royal Botanic Gardens, Kew</small>`
                );
            }
        }

    }).addTo(map3);

    console.log('Map 3 potato distribution loaded successfully!');
})
.catch(error => {
    console.error('Map 3 distribution error:', error);
});
