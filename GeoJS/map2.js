
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
   MAP 2: COUNTRY BOUNDARIES
   ========================================== */

fetch('Data/world-countries.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Could not load country boundaries');
        }
        return response.json();
    })
    .then(data => {
        L.geoJSON(data, {
            style: {
                color: '#254E46',
                weight: 1,
                fillColor: '#E9D9B8',
                fillOpacity: 0.5
            },

            onEachFeature: function(feature, layer) {
                const countryName =
                    feature.properties.name || 'Unknown country';

                layer.bindPopup(countryName);
            }
        }).addTo(foodMap);

        console.log('Country boundaries loaded!');
    })
    .catch(error => {
        console.error('Error loading country boundaries:', error);
    });




// Confirm that Map 2 loaded successfully
console.log('Map 2 loaded successfully!');
