
/* =====================================================
   MAP 3: FOODS ON THE MOVE
   Botanical distribution and historical journeys
   ===================================================== */

// STEP 1: INITIALIZE THE MAP

const map3 = L.map('map3-map', {
    worldCopyJump: true,
    scrollWheelZoom: false
}).setView([15, 0], 2);

// World basemap
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

// Colored country distribution layer
let map3DistributionLayer = null;

// Historical routes and markers have separate layers
const map3HistoricalRoutes = L.layerGroup().addTo(map3);
const map3HistoricalMarkers = L.layerGroup().addTo(map3);

// Botanical distribution colors
const map3Colors = {
    native: '#719C65',
    introduced: '#AA7AB1'
};

// Food names for legends and popups
const map3FoodNames = {
    potato: 'Potato',
    tomato: 'Tomato',
    cacao: 'Cacao',
    coffee: 'Coffee',
    apple: 'Apple',
    corn: 'Corn'
};

// Distribution data loaded from CSV and GeoJSON
let map3DistributionRows = [];
let map3WorldGeoJSON = null;


/* =====================================================
   STEP 3: HISTORICAL MARKER HELPER
   Ochre numbered circles with sapphire borders
   ===================================================== */

function addMap3HistoricalMarker(position, number, popupText) {

    const numberedIcon = L.divIcon({
        className: 'map3-history-marker',
        html: `<span class="map3-history-number">${number}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });

    L.marker(position, {
        icon: numberedIcon,
        title: `Historical stop ${number}`,
        alt: `Historical stop ${number}`,
        keyboard: true
    })
        .bindPopup(popupText, {
            maxWidth: 260
        })
        .addTo(map3HistoricalMarkers);
}


/* =====================================================
   STEP 4: HISTORICAL ROUTE HELPER
   Dashed garnet lines with directional arrowheads
   ===================================================== */

function addMap3Route(start, end) {

    // Draw the dashed historical route
    L.polyline([start, end], {
        color: '#762E43',
        weight: 3,
        opacity: 0.9,
        dashArray: '8, 7',
        interactive: false
    }).addTo(map3HistoricalRoutes);

    // Approximate midpoint of the route
    const midpoint = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2
    ];

    // Calculate the direction of the route
    const angle = Math.atan2(
        end[0] - start[0],
        end[1] - start[1]
    ) * 180 / Math.PI;

    // Add a directional arrowhead
    L.marker(midpoint, {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
            className: 'map3-route-arrow',
            html: `
                <span style="
                    display: block;
                    width: 24px;
                    height: 24px;
                    color: #762E43;
                    font-size: 25px;
                    font-weight: bold;
                    text-align: center;
                    line-height: 24px;
                    text-shadow: 1px 1px 2px #FFF9EF;
                    transform: rotate(${-angle}deg);
                ">➜</span>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        })
    }).addTo(map3HistoricalRoutes);
}


/* =====================================================
   STEP 5: DISPLAY THE SELECTED FOOD
   ===================================================== */

function showMap3Food(foodId) {

    // Match country codes to botanical distribution
    const foodCountries = {};

    map3DistributionRows.forEach(row => {
        if (row.food_id === foodId && row.iso_a3) {
            foodCountries[row.iso_a3.trim().toUpperCase()] =
                row.distribution_status.trim();
        }
    });

    // Remove the previous colored country layer
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

    // Highlight the selected food button
    document.querySelectorAll('.map3-food-btn').forEach(button => {
        const isSelected = button.dataset.food === foodId;

        button.classList.toggle('active', isSelected);
        button.setAttribute('aria-pressed', String(isSelected));
    });


    /* =================================================
       STEP 6: HISTORICAL JOURNEYS
       ================================================= */

    // Clear the previous food's markers and routes
    map3HistoricalMarkers.clearLayers();
    map3HistoricalRoutes.clearLayers();

    // POTATO HISTORICAL JOURNEY
    if (foodId === 'potato') {

        // Coordinates of the three historical stops
        const andes = [-15.8, -69.4];
        const canaryIslands = [28.3, -16.6];
        const ireland = [53.4, -8.0];

        // First stop: Andes
        addMap3HistoricalMarker(andes, 1, `
            <strong>🥔 The Andes</strong><br>
            <em>Before European contact</em><br><br>
            Indigenous Andean communities cultivated potatoes
            thousands of years before their introduction to Europe.
        `);

        // Second stop: Canary Islands
        addMap3HistoricalMarker(canaryIslands, 2, `
            <strong>🥔 Canary Islands</strong><br>
            <em>1560s</em><br><br>
            Historical records document potatoes in the Canary Islands
            during the sixteenth century. The islands were an important
            early point in the potato's Atlantic movement.
        `);

        // Third stop: Ireland
        addMap3HistoricalMarker(ireland, 3, `
            <strong>🥔 Ireland</strong><br>
            <em>By the late 1700s</em><br><br>
            Potatoes became a major staple food in Ireland,
            transforming agricultural practices and everyday diets.
        `);

        // Connect the three historical stops
        addMap3Route(andes, canaryIslands);
        addMap3Route(canaryIslands, ireland);
    }
}


/* =====================================================
   STEP 7: LOAD DISTRIBUTION DATA
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

    // Read the botanical distribution CSV
    map3DistributionRows = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
    }).data;

    // Store the world country boundaries
    map3WorldGeoJSON = worldGeoJSON;

    // Display potatoes when the page first loads
    showMap3Food('potato');

    // Connect the six food buttons
    document.querySelectorAll('.map3-food-btn').forEach(button => {
        button.addEventListener('click', () => {
            showMap3Food(button.dataset.food);
        });
    });

    console.log('Map 3 distribution and historical journeys ready!');
})
.catch(error => {
    console.error('Map 3 distribution error:', error);
});
