
/* ==========================================
   MAP 2: GLOBAL FOOD PATTERNS
   Interactive Choropleth
   ========================================== */

// Create the Leaflet map
const foodMap = L.map('map2-map', {
    worldCopyJump: true
}).setView([15, 0], 2);


/* MAP 2: ESRI BASEMAP */
L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
    }
).addTo(foodMap);


/* ==========================================
   MAP 2: COLOR SCALE
   Colorblind-friendly sequential blues
   ========================================== */

function getFoodColor(value) {
    if (value === null || !Number.isFinite(value)) {
        return '#D9D9D9';
    }

    if (value > 500) return '#08519C';
    if (value > 350) return '#3182BD';
    if (value > 200) return '#6BAED6';
    if (value > 100) return '#BDD7E7';

    return '#EFF3FF';
}


/* ==========================================
   MAP 2: DATA AND CURRENT SELECTION
   ========================================== */

let foodData = {};
let countryLayer = null;
let selectedFood = 'All meat';


/* MAP 2: UPDATE THE CHOROPLETH */

function updateFoodMap() {

    if (!countryLayer) return;

    countryLayer.eachLayer(function(layer) {

        const feature = layer.feature;

        const iso = String(
            feature.properties.iso_a3 || ''
        ).toUpperCase();

        const record = foodData[selectedFood]?.[iso];

        const value = record ? record.value : null;

        layer.setStyle({
            color: '#254E46',
            weight: 1,
            fillColor: getFoodColor(value),
            fillOpacity: 0.85
        });

        const countryName =
            feature.properties.name || iso;

        if (record) {

            layer.bindPopup(
                '<strong>' + countryName + '</strong><br>' +
                selectedFood + ' (2023):<br>' +
                record.value.toFixed(1) + ' ' +
                record.unit
            );

        } else {

            layer.bindPopup(
                '<strong>' + countryName + '</strong><br>' +
                'No data available for this category.'
            );

        }

    });

    /* ==========================================
   MAP 2: EDUCATIONAL DESCRIPTIONS
   ========================================== */

const descriptions = {
    'All meat':
        'How much of the world’s daily food energy comes from meat? ' +
        'Explore how the availability of meat differs between countries. ' +
        'These figures measure calories available per person each day, ' +
        'not necessarily how much people actually eat.',

    'Fruit':
        'Do people around the world have the same access to fruit? ' +
        'Explore how fruit availability differs between countries ' +
        'and think about how geography, agriculture, and trade ' +
        'might influence these patterns.'
};

const description =
    document.getElementById('map2-description');

if (description) {
    description.textContent =
        descriptions[selectedFood] ||
        'Explore global food patterns using 2023 data.';
}

}


/* ==========================================
   MAP 2: LOAD CSV AND COUNTRY BOUNDARIES
   ========================================== */

Promise.all([

    fetch('Data/food-map2.csv').then(response => {
        if (!response.ok) {
            throw new Error('Food CSV not found');
        }
        return response.text();
    }),

    fetch('Data/world-countries.geojson').then(response => {
        if (!response.ok) {
            throw new Error('Country GeoJSON not found');
        }
        return response.json();
    })

])

.then(([csvText, countryGeoJSON]) => {

    // Read CSV using Papa Parse
    const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
    });

    // Organize values by food category and ISO code
    parsed.data.forEach(row => {

        const category =
            row['Food / Statistic']?.trim();

        const year = row['Year']?.trim();

        const iso =
            row['ISO Code']?.trim().toUpperCase();

        const rawValue = row['Value']?.trim();
        const value = Number(rawValue);

        if (
            category &&
            year === '2023' &&
            iso &&
            rawValue !== '' &&
            Number.isFinite(value)
        ) {

            if (!foodData[category]) {
                foodData[category] = {};
            }

            foodData[category][iso] = {
                value: value,
                unit: row['Unit'] || ''
            };

        }

    });

    // Create the country layer once
    countryLayer = L.geoJSON(countryGeoJSON).addTo(foodMap);

    // Display the default category
    updateFoodMap();

    console.log(
        'Available food categories:',
        Object.keys(foodData)
    );

    console.log('Map 2 data loaded successfully!');

})

.catch(error => {
    console.error('Map 2 loading error:', error);
});


/* ==========================================
   MAP 2: RADIO BUTTON INTERACTIONS
   ========================================== */

document.querySelectorAll(
    'input[name="foodCategory"]'
).forEach(function(radio) {

    radio.addEventListener('change', function() {

        if (this.checked) {

            selectedFood = this.value;

            updateFoodMap();

        }

    });

});

console.log('Map 2 JavaScript initialized!');
