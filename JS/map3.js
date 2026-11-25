
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

const map3FoodEmoji = { potato:'🥔', tomato:'🍅', cacao:'🍫', coffee:'☕', apple:'🍎', corn:'🌽' };

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

// Animated historical journeys: two routes branch from the first stop.
// The routes are generalized illustrations, not documented direct voyages.
let map3AnimationFrame = null;
let map3ActiveFood = 'potato';
let map3JourneyRoutes = [];

// Add our styles without requiring changes to index.html.
const map3AnimationStyles = document.createElement('style');
map3AnimationStyles.textContent = `
    #map3-map .leaflet-popup-content-wrapper { background:#FAF8F2; border:3px solid #762E43; border-radius:12px; }
    #map3-map .leaflet-popup-tip { background:#762E43; }
    #map3-map .leaflet-popup-close-button { color:#762E43; }
    #map3-map .leaflet-popup-content { font:400 13px/1.5 Verdana,sans-serif; color:#24476A; width:min(250px, calc(100vw - 120px)) !important; margin:16px; overflow-wrap:anywhere; }
    #map3-map .map3-popup h3 { font:400 25px/1.15 'Lilita One',sans-serif; color:#762E43; text-align:center; margin:0 0 8px; }
    #map3-map .map3-popup-food { text-align:center; font-weight:bold; }
    #map3-map .map3-popup hr { border-color:#B58438; opacity:.65; margin:10px 0; }
    #map3-map .map3-popup-date { text-align:center; color:#254E46; font-weight:bold; font-size:15px; }
    #map3-map .map3-popup p { margin:8px 0 0; }
    #map3-map .map3-popup-status { text-align:center; font-weight:bold; color:#254E46; }

    .map3-history-dot {
        display:block; width:15px; height:15px; border-radius:50%;
        background:#B58438; border:3px solid #24476A;
        box-shadow:0 2px 5px rgba(0,0,0,.3);
    }
    .map3-ship-icon { background:transparent; border:0; }
    .map3-ship-icon span {
        display:block; font-size:24px; line-height:28px;
        filter:drop-shadow(1px 2px 1px #FFF9EF);
    }
    #map3-replay-button {
        margin-top:14px; width:100%; padding:9px 12px;
        border:2px solid #762E43; border-radius:6px;
        background:#FAF8F2; color:#762E43;
        font: bold 14px Verdana, sans-serif; cursor:pointer;
    }
    #map3-replay-button:hover { background:#E9D9B8; }
    #map3-replay-button:focus-visible {
        outline:3px solid #24476A; outline-offset:3px;
    }
`;
document.head.appendChild(map3AnimationStyles);

// Add a small, unnumbered historical location marker.
function addMap3HistoricalMarker(position, stop, popupText) {
    const dotIcon = L.divIcon({
        className: 'map3-history-marker',
        html: '<span class="map3-history-dot"></span>',
        iconSize: [15, 15],
        iconAnchor: [7, 7],
        popupAnchor: [0, -10]
    });

    L.marker(position, {
        icon: dotIcon,
        title: stop.name || 'Historical location',
        alt: stop.name || 'Historical location',
        keyboard: true
    })
    .bindPopup(popupText, { maxWidth: 280, autoPan: true, autoPanPadding: [20, 20] })
    .addTo(map3HistoricalMarkers);
}

function map3StopPosition(stop) {
    return [stop.latitude, stop.longitude];
}

function map3CancelAnimation() {
    if (map3AnimationFrame !== null) {
        cancelAnimationFrame(map3AnimationFrame);
        map3AnimationFrame = null;
    }
}

// Calculate the ship's position between the origin and destination.
// Projected coordinates keep the ship on the visible Leaflet line.
function map3PositionAlong(start, end, progress) {
    const a = map3.project(L.latLng(start), 3);
    const b = map3.project(L.latLng(end), 3);

    return map3.unproject(L.point(
        a.x + (b.x - a.x) * progress,
        a.y + (b.y - a.y) * progress
    ), 3);
}

// Draw the two routes and animate ships along them.
function map3DrawJourney(animate = true) {
    map3CancelAnimation();
    map3HistoricalRoutes.clearLayers();

    if (!map3JourneyRoutes.length) return;

    const reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const shouldAnimate = animate && !reduceMotion;

    const visuals = map3JourneyRoutes.map(route => {
        const line = L.polyline([], {
            color: '#762E43',
            weight: 3,
            opacity: 0.9,
            dashArray: '8, 7',
            interactive: false
        }).addTo(map3HistoricalRoutes);

        // Emoji ships require no extra images or Leaflet plugins.
        const ship = shouldAnimate ? L.marker(route.start, {
            interactive: false,
            keyboard: false,
            icon: L.divIcon({
                className: 'map3-ship-icon',
                html: '<span aria-hidden="true">⛵</span>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map3HistoricalRoutes) : null;

        return { ...route, line, ship };
    });

    function render(progress) {
        visuals.forEach(route => {
            const point = map3PositionAlong(
                route.start,
                route.end,
                progress
            );

            // Reveal the route progressively.
            route.line.setLatLngs([route.start, point]);

            // Move the ship to the end of the growing route.
            if (route.ship) {
                route.ship.setLatLng(point);
            }
        });
    }

    if (!shouldAnimate) {
        render(1);
        return;
    }

    const duration = 4200;
    let startTime = null;

    function frame(timestamp) {
        if (startTime === null) startTime = timestamp;

        const t = Math.min(
            1,
            (timestamp - startTime) / duration
        );

        render(t);

        if (t < 1) {
            map3AnimationFrame = requestAnimationFrame(frame);
        } else {
            map3AnimationFrame = null;

            // Leave the completed lines visible,
            // but remove the ships at the destinations.
            visuals.forEach(route => {
                if (route.ship) {
                    map3HistoricalRoutes.removeLayer(route.ship);
                }
            });
        }
    }

    map3AnimationFrame = requestAnimationFrame(frame);
}

// Read and display historical locations for the selected food.
function showMap3HistoricalJourney(foodId) {
    map3CancelAnimation();
    map3HistoricalMarkers.clearLayers();
    map3HistoricalRoutes.clearLayers();

    const stops = map3HistoricalStops
        .filter(row =>
            String(row['Food ID'] || '')
                .trim()
                .toLowerCase() === foodId
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
        const popup = `
            <div class="map3-popup">
                <h3>${map3EscapeHTML(stop.name)}</h3>
                <div class="map3-popup-food">${map3FoodEmoji[foodId] || ''} ${map3EscapeHTML(map3FoodNames[foodId])}</div>
                <hr>
                <div class="map3-popup-date">${map3EscapeHTML(stop.date)}</div>
                <p>${map3EscapeHTML(stop.description)}</p>
            </div>
        `;

        addMap3HistoricalMarker(
            map3StopPosition(stop),
            stop,
            popup
        );
    });

    // Branch from the first stop to all later stops
    // that belong to the same route group.
    map3JourneyRoutes = [];

    if (stops.length >= 2) {
        const origin = stops[0];

        stops.slice(1).forEach(stop => {
            if (
                origin.routeGroup &&
                origin.routeGroup === stop.routeGroup
            ) {
                map3JourneyRoutes.push({
                    start: map3StopPosition(origin),
                    end: map3StopPosition(stop)
                });
            }
        });
    }

    map3DrawJourney(true);
}

// Create a Replay Journey button automatically.
function map3AddReplayButton() {
    const controls = document.getElementById(
        'map3-food-controls'
    );

    if (
        !controls ||
        document.getElementById('map3-replay-button')
    ) {
        return;
    }

    const replay = document.createElement('button');

    replay.type = 'button';
    replay.id = 'map3-replay-button';
    replay.textContent = '⛵ Replay Journey';

    replay.setAttribute(
        'aria-label',
        'Replay the historical journey animation'
    );

    replay.addEventListener('click', () => {
        map3DrawJourney(true);
    });

    controls.insertAdjacentElement('afterend', replay);
}

// Display the botanical distribution and historical journey.
function showMap3Food(foodId) {
    map3ActiveFood = foodId;

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
                    <div class="map3-popup">
                        <h3>${map3EscapeHTML(countryName)}</h3>
                        <div class="map3-popup-food">${map3FoodEmoji[foodId] || ''} ${map3EscapeHTML(map3FoodNames[foodId])}</div>
                        <hr>
                        <div class="map3-popup-status">${map3EscapeHTML(status)} range</div>
                    </div>
                `, { maxWidth: 280, autoPan: true, autoPanPadding: [20, 20] });
            }
        }
    }).addTo(map3);

    document.getElementById(
        'map3-legend-title'
    ).textContent =
        map3FoodNames[foodId] + ' Distribution';

    document.querySelectorAll(
        '.map3-food-btn'
    ).forEach(button => {
        const isSelected =
            button.dataset.food === foodId;

        button.classList.toggle(
            'active',
            isSelected
        );

        button.setAttribute(
            'aria-pressed',
            String(isSelected)
        );
    });

    showMap3HistoricalJourney(foodId);
}

// Load the CSVs and GeoJSON before displaying the map.
Promise.all([
    fetch('Data/map3_distribution_country_codes.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error(
                    'Could not load Map 3 distribution CSV'
                );
            }

            return response.text();
        }),

    fetch('Data/world-countries.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error(
                    'Could not load world GeoJSON'
                );
            }

            return response.json();
        }),

    fetch('Data/map3_historical_stops.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error(
                    'Could not load historical stops CSV'
                );
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

    map3AddReplayButton();
    showMap3Food('potato');

    document.querySelectorAll(
        '.map3-food-btn'
    ).forEach(button => {
        button.addEventListener('click', () => {
            showMap3Food(button.dataset.food);
        });
    });

    console.log(
        `🌎 Map 3 is being awesome! ${map3HistoricalStops.length} historical stops loaded!`
    );

    console.log('📚 Learning activated!');
})
.catch(error => {
    console.error(
        '❌ Map 3 encountered a problem:',
        error
    );
});
