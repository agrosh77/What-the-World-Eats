
const map3 = L.map('map3-map', {
    worldCopyJump: true,
    scrollWheelZoom: false
}).setView([15, 0], 2);

L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 17
    }
).addTo(map3);

setTimeout(() => map3.invalidateSize(), 200);

let map3DistributionLayer = null;

const map3HistoricalRoutes = L.layerGroup().addTo(map3);
const map3HistoricalMarkers = L.layerGroup().addTo(map3);

const map3Colors = {
    native: '#719C65',
    introduced: '#AA7AB1'
};

const map3FoodNames = {
    potato: 'Potato',
    tomato: 'Tomato',
    cacao: 'Cacao',
    coffee: 'Coffee',
    apple: 'Apple',
    corn: 'Corn'
};

let map3DistributionRows = [];
let map3HistoricalStops = [];
let map3WorldGeoJSON = null;

// Safely display spreadsheet text inside popup HTML.
function map3EscapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Create a numbered historical marker.
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
        .bindPopup(popupText, { maxWidth: 260 })
        .addTo(map3HistoricalMarkers);
}

// Draw a dashed route and directional arrow.
function addMap3Route(start, end) {
    L.polyline([start, end], {
        color: '#762E43',
        weight: 3,
        opacity: 0.9,
        dashArray: '8, 7',
        interactive: false
    }).addTo(map3HistoricalRoutes);

    const midpoint = [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2
    ];

    const angle =
        Math.atan2(end[0] - start[0], end[1] - start[1]) *
        180 / Math.PI;

    L.marker(midpoint, {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
            className: 'map3-route-arrow',
            html: `
                <span style="
                    display:block;
                    width:24px;
                    height:24px;
                    color:#762E43;
                    font-size:25px;
                    font-weight:bold;
                    text-align:center;
                    line-height:24px;
                    text-shadow:1px 1px 2px #FFF9EF;
                    transform:rotate(${-angle}deg);
                ">➜</span>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        })
    }).addTo(map3HistoricalRoutes);
}

// Read and display the historical stops for one food.
function showMap3HistoricalJourney(foodId) {
    map3HistoricalMarkers.clearLayers();
    map3HistoricalRoutes.clearLayers();

    const stops = map3HistoricalStops
        .filter(row =>
            String(row['Food ID'] || '').trim().toLowerCase() === foodId
        )
        .map(row => ({
            order: Number(row['Stop Order']),
            name: row['Location Name'],
            latitude: Number(row['Latitude']),
            longitude: Number(row['Longitude']),
            date: row['Approximate Date'],
            description: row['Historical Fact / Popup Text'],
            routeGroup: String(row['Route Group'] || '').trim()
        }))
        .filter(stop =>
            Number.isFinite(stop.order) &&
            Number.isFinite(stop.latitude) &&
            Number.isFinite(stop.longitude) &&
            stop.latitude >= -90 &&
            stop.latitude <= 90 &&
            stop.longitude >= -180 &&
            stop.longitude <= 180
        )
        .sort((a, b) => a.order - b.order);

    stops.forEach(stop => {
        const position = [stop.latitude, stop.longitude];

        // Clean historical popup:
        // location, date, and description only.
        const popup = `
            <strong>${map3EscapeHTML(stop.name)}</strong>
            <br>
            <em>${map3EscapeHTML(stop.date)}</em>
            <br><br>
            ${map3EscapeHTML(stop.description)}
        `;

        addMap3HistoricalMarker(
            position,
            stop.order,
            popup
        );
    });

    // Connect consecutive stops within the same route group.
    for (let i = 1; i < stops.length; i++) {
        const previous = stops[i - 1];
        const current = stops[i];

        if (
            previous.routeGroup &&
            previous.routeGroup === current.routeGroup
        ) {
            addMap3Route(
                [previous.latitude, previous.longitude],
                [current.latitude, current.longitude]
            );
        }
    }
}

// Display a food's botanical distribution and historical journey.
function showMap3Food(foodId) {
    const foodCountries = {};

    map3DistributionRows.forEach(row => {
        if (row.food_id === foodId && row.iso_a3) {
            foodCountries[
                row.iso_a3.trim().toUpperCase()
            ] = row.distribution_status.trim();
        }
    });

    if (map3DistributionLayer) {
        map3.removeLayer(map3DistributionLayer);
    }

    map3DistributionLayer = L.geoJSON(map3WorldGeoJSON, {
        style: feature => {
            const status =
                foodCountries[feature.properties.iso_a3];

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

                layer.bindPopup(`
                    <strong>${map3EscapeHTML(countryName)}</strong>
                    <br>
                    ${map3EscapeHTML(map3FoodNames[foodId])}
                    distribution: ${map3EscapeHTML(status)}
                    <br>
                    <small>Source: Royal Botanic Gardens, Kew</small>
                `);
            }
        }
    }).addTo(map3);

    document.getElementById('map3-legend-title').textContent =
        map3FoodNames[foodId] + ' Distribution';

    document.querySelectorAll('.map3-food-btn').forEach(button => {
        const isSelected = button.dataset.food === foodId;

        button.classList.toggle('active', isSelected);
        button.setAttribute(
            'aria-pressed',
            String(isSelected)
        );
    });

    showMap3HistoricalJourney(foodId);
}

// Load botanical distribution, country boundaries,
// and historical stops before displaying the map.
Promise.all([
    fetch('Data/map3_distribution_country_codes.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not load Map 3 distribution CSV');
            }
            return response.text();
        }),

    fetch('Data/world-countries.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not load world GeoJSON');
            }
            return response.json();
        }),

    fetch('Data/map3_historical_stops.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not load historical stops CSV');
            }
            return response.text();
        })
])
.then(([distributionCSV, worldGeoJSON, historicalCSV]) => {
    map3DistributionRows = Papa.parse(distributionCSV, {
        header: true,
        skipEmptyLines: true
    }).data;

    map3WorldGeoJSON = worldGeoJSON;

    map3HistoricalStops = Papa.parse(historicalCSV, {
        header: true,
        skipEmptyLines: true
    }).data;

    showMap3Food('potato');

    document.querySelectorAll('.map3-food-btn').forEach(button => {
        button.addEventListener('click', () => {
            showMap3Food(button.dataset.food);
        });
    });

    // Customize console
    console.log(
        `🌎 Map 3 is being awesome! ${map3HistoricalStops.length} historical stops loaded!`
    );

    console.log('📚 Learning activated!');
})
.catch(error => {
    console.error('❌ Map 3 encountered a problem:', error);
});
