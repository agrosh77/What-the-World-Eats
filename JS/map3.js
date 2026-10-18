
/* =====================================================
   MAP 3: FOODS ON THE MOVE
   Interactive botanical distribution and historical map
   ===================================================== */

// STEP 1: Initialize the Leaflet map
const map3 = L.map('map3-map', {
    worldCopyJump: true,
    scrollWheelZoom: false
}).setView([15, 0], 2);

// Add the world basemap
L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 17
    }
).addTo(map3);

// Make sure the map fits its container
setTimeout(() => {
    map3.invalidateSize();
}, 200);


/* =====================================================
   STEP 2: SET UP MAP LAYERS AND COLORS
   ===================================================== */

// Store the colored country layer
let map3DistributionLayer = null;

// Store historical markers in their own layer
const map3HistoricalMarkers = L.layerGroup().addTo(map3);

// Colors for botanical distribution
const map3Colors = {
    native: '#719C65',
    introduced: '#AA7AB1'
};

// Food names for the legend and popups
const map3FoodNames = {
    potato: 'Potato',
    tomato: 'Tomato',
    cacao: 'Cacao',
    coffee: 'Coffee',
    apple: 'Apple',
    corn: 'Corn'
};

// Store the distribution data after loading
let map3DistributionRows = [];
let map3WorldGeoJSON = null;


/* =====================================================
   STEP 3: DISPLAY THE SELECTED FOOD
   ===================================================== */

function showMap3Food(foodId) {

    // Find the selected food's country distribution
    const foodCountries = {};

    map3DistributionRows.forEach(row => {
        if (row.food_id === foodId && row.iso_a3) {
            foodCountries[row.iso_a3.trim().toUpperCase()] =
                row.distribution_status.trim();
        }
    });

    // Remove the previous distribution layer
    if (map3DistributionLayer) {
        map3.removeLayer(map3DistributionLayer);
    }

    // Draw the selected food's distribution
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

    // Update the selected food button
    document.querySelectorAll('.map3-food-btn').forEach(button => {
        const isSelected = button.dataset.food === foodId;

        button.classList.toggle('active', isSelected);
        button.setAttribute('aria-pressed', String(isSelected));
    });


    /* =================================================
       STEP 4: HISTORICAL JOURNEY MARKERS
       ================================================= */

    // Remove historical markers from the previous food
    map3HistoricalMarkers.clearLayers();

    // POTATO: First historical stop
    if (foodId === 'potato') {

        L.marker([-15.8, -69.4])
            .bindPopup(`
                <strong>🥔 The Andes: Origins of Potato Cultivation</strong>
                <br>
                <em>Before European contact</em>
                <br><br>
                Indigenous Andean communities cultivated potatoes
                thousands of years before they spread to Europe
                and other parts of the world.
                <br><br>
                <small>
                    Location: Lake Titicaca region
                    <br>
                    Approximate historical location
                </small>
            `)
            .addTo(map3HistoricalMarkers);
    }

    // Keep the historical markers above the country shading
    map3HistoricalMarkers.bringToFront?.();
}


/* =====================================================
   STEP 5: LOAD DISTRIBUTION DATA
   ===================================================== */

Promise.all([
    fetch('Data/map3_distribution_country_codes.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not load Map 3 CSV');
            }
            return response.text();
        }),

    fetch('Data/world-countries.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not load world GeoJSON');
            }
            return response.json();
        })
])
.then(([csvText, worldGeoJSON]) => {

    // Read distribution records
    map3DistributionRows = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
    }).data;

    // Store world boundaries
    map3WorldGeoJSON = worldGeoJSON;

    // Show potatoes by default
    showMap3Food('potato');

    // Connect all six food buttons
    document.querySelectorAll('.map3-food-btn').forEach(button => {
        button.addEventListener('click', () => {
            showMap3Food(button.dataset.food);
        });
    });

    console.log('Map 3 distribution and historical markers ready!');
})
.catch(error => {
    console.error('Map 3 distribution error:', error);
});
