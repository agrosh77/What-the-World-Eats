
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

// Load our CSV and country boundaries
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
