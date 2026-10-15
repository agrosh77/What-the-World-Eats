
/* ==========================================
   MAP 2: GLOBAL FOOD PATTERNS
   Basic Leaflet World Map
   ========================================== */

// Create the map inside the Map 2 container
const foodMap = L.map('map2-map', {
    worldCopyJump: true
}).setView([15, 0], 2);



/* MAP 2: ESRI WORLD TOPOGRAPHIC BASEMAP */
L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
    }
).addTo(foodMap);



/* ==========================================
   MAP 2: FIRST CHOROPLETH
   Food supply from all meat, 2023
   ========================================== */

// Color scale: light to dark blue
function getMeatColor(value) {
    if (value === null || !Number.isFinite(value)) {
        return '#D9D9D9';
    }

    if (value > 500) return '#24476A';
    if (value > 350) return '#426C8B';
    if (value > 200) return '#7196AF';
    if (value > 100) return '#A6C3D3';
    return '#DCEAF0';
}

// Load the food data and country boundaries together
Promise.all([
    fetch('Data/food-map2.csv').then(response => {
        if (!response.ok) throw new Error('CSV not found');
        return response.text();
    }),

    fetch('Data/world-countries.geojson').then(response => {
        if (!response.ok) throw new Error('GeoJSON not found');
        return response.json();
    })
])
.then(([csvText, countryGeoJSON]) => {

    // Convert the CSV into JavaScript objects
    const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
    });

    // Store meat supply values by country ISO code
    const meatData = {};

    parsed.data.forEach(row => {
        if (
            row['Food / Statistic']?.trim() === 'All meat' &&
            row['Year']?.trim() === '2023'
        ) {
            const iso = row['ISO Code']?.trim().toUpperCase();
            const value = Number(row['Value']);

            if (iso && row['Value']?.trim() !== '' &&
                Number.isFinite(value)) {
                meatData[iso] = {
                    country: row['Country'],
                    value: value,
                    unit: row['Unit']
                };
            }
        }
    });

    // Draw and color the country polygons
    L.geoJSON(countryGeoJSON, {

        style: function(feature) {
            const iso = feature.properties.iso_a3;
            const record = meatData[iso];

            return {
                color: '#254E46',
                weight: 1,
                fillColor: getMeatColor(record ? record.value : null),
                fillOpacity: 0.85
            };
        },

        onEachFeature: function(feature, layer) {
            const iso = feature.properties.iso_a3;
            const record = meatData[iso];
            const name = feature.properties.name || iso;

            if (record) {
                layer.bindPopup(
                    '<strong>' + name + '</strong><br>' +
                    'Meat calorie supply (2023):<br>' +
                    record.value.toFixed(1) +
                    ' kcal per person per day'
                );
            } else {
                layer.bindPopup(
                    '<strong>' + name + '</strong><br>' +
                    'No data available for this statistic.'
                );
            }
        }
    }).addTo(foodMap);

    console.log('First choropleth loaded!');
    console.log('Countries with meat data:',
                Object.keys(meatData).length);
})
.catch(error => {
    console.error('Map 2 data loading error:', error);
});





// Confirm that Map 2 loaded successfully
console.log('Map 2 loaded successfully!');
