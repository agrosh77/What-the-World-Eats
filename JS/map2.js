
/* ==========================================
   MAP 2: GLOBAL FOOD PATTERNS
   Interactive choropleth
   ========================================== */

// Create the Leaflet map
const foodMap = L.map('map2-map', {
    worldCopyJump: true
}).setView([15, 0], 2);


/* ==========================================
   MAP 2: ESRI BASEMAP
   ========================================== */

L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19
    }
).addTo(foodMap);


/* ==========================================
   MAP 2: FOOD CATEGORY SETTINGS
   ========================================== */

// Colors run from lowest to highest values.
// Each category uses five sequential colors.

const foodSettings = {

    'All meat': {
        title: 'All Meat',
        colors: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'],  
description:
    'How much of the world’s available food energy comes from meat? ' +
    'As you explore the map, notice which countries have higher or ' +
    'lower values. Do certain regions share similar patterns? ' +
    'Meat availability can be influenced by livestock farming, ' +
    'economic conditions, cultural traditions, and international ' +
    'trade. But remember, these numbers represent calories ' +
    'available per person, not necessarily what individuals ' +
    'actually eat. What might explain the differences you discover?'

    },

    'Fruit': {
        title: 'Fruit',
        colors: ['#fff7bc', '#fec44f', '#fe9929', '#ec7014', '#cc4c02'],
        description:
    'From tropical mangoes to apples grown in cooler climates, ' +
    'fruit is an important part of diets around the world. ' +
    'But where are calories from fruit most widely available? ' +
    'Explore the map and look for regional patterns. ' +
    'Are countries with warmer climates always higher, or do ' +
    'you notice some surprises? Think about how growing ' +
    'conditions, transportation, preservation, and international ' +
    'trade make it possible for people to enjoy fruits grown ' +
    'thousands of miles away.'
    },

    'Nuts': {
        title: 'Nuts',
        colors: ['#f1eef6', '#bdc9e1', '#74a9cf', '#2b8cbe', '#045a8d'],
        
description:
    'Almonds, peanuts, walnuts, and other nuts appear in cuisines ' +
    'across the world, from everyday snacks to traditional dishes. ' +
    'Explore where calories from nuts are most widely available. ' +
    'Do you notice clusters of countries with similar values? ' +
    'Some nuts are closely associated with particular growing ' +
    'regions, but international trade carries them far beyond ' +
    'their places of origin. How might local agriculture, ' +
    'culinary traditions, and access to imported foods influence ' +
    'the patterns you see?'

    },

    'Rice': {
        title: 'Rice',
        colors: ['#ffffcc', '#c2e699', '#78c679', '#31a354', '#006837'],
        
description:
    'Rice is one of the world’s most important staple foods, ' +
    'but its role in everyday diets varies enormously. ' +
    'Where is the greatest amount of rice available per person? ' +
    'Explore Asia, Africa, and the Americas, and look for ' +
    'similarities and differences. Rice cultivation depends on ' +
    'particular environmental conditions, but centuries of ' +
    'migration, trade, and cultural exchange have also shaped ' +
    'where people grow and eat it. Can you identify regions ' +
    'where rice plays a particularly important role?'

    },

    'Wheat': {
        title: 'Wheat',
        colors: ['#ffffd4', '#fed98e', '#fe9929', '#d95f0e', '#993404'],
        
description:
    'Bread, pasta, noodles, and countless other foods begin with ' +
    'wheat. But how important is wheat to food supplies around ' +
    'the world? Explore the map and compare regions where wheat ' +
    'provides a large share of available calories with those ' +
    'where other staples may be more important. Wheat has ' +
    'traveled alongside human migration, expanding agriculture, ' +
    'and global trade for thousands of years. What connections ' +
    'can you find between geography, history, and the patterns ' +
    'on the map?'

    },

    'Corn': {
        title: 'Corn / Maize',
        colors: ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'],
        
description:
    'Did you know that maize was first domesticated in the ' +
    'Americas thousands of years ago? Today, it is grown and ' +
    'eaten around the world. Explore where maize contributes ' +
    'the most calories to national food supplies. You might ' +
    'recognize its importance in foods like tortillas, tamales, ' +
    'and ugali, but its role varies widely between regions. ' +
    'How did a crop with roots in the Americas become so ' +
    'important elsewhere? What does this map reveal about ' +
    'the movement of food through history?'

    },

    'Cheese': {
        title: 'Cheese',
        colors: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#e34a33'],
        
description:
    'From mozzarella and cheddar to feta and countless regional ' +
    'varieties, cheese reflects a long history of dairy farming ' +
    'and food traditions. But which countries produce the most? ' +
    'Explore the map and compare national production totals. ' +
    'Unlike the other food availability maps, this statistic ' +
    'measures total cheese production in tonnes, not the amount ' +
    'available per person. That means population size, the scale ' +
    'of the dairy industry, and international exports can all ' +
    'influence the results. Does a country producing more cheese ' +
    'necessarily mean its people eat more?'

    },

    'Sugar cane': {
        title: 'Sugar Cane',
        colors: ['#edf8fb', '#b2e2e2', '#66c2a4', '#2ca25f', '#006d2c'],
       
description:
    'Sugar cane has a fascinating history connecting agriculture, ' +
    'trade, colonization, and global food systems. Originally ' +
    'cultivated in parts of Asia and the Pacific, it spread ' +
    'across the world and became an important plantation crop. ' +
    'Explore the map and notice how many countries report little ' +
    'or no calorie availability in this category. Why might ' +
    'that be? Consider climate, agricultural production, food ' +
    'processing, and the difference between raw crops and the ' +
    'foods made from them. Remember that these figures do not ' +
    'represent all sugar consumed.'

    },

    'Total daily calorie supply': {
        title: 'Total Daily Calorie Supply',
        colors: ['#f2f0f7', '#cbc9e2', '#9e9ac8', '#756bb1', '#54278f'],
       
description:
    'How much food energy is available to people around the ' +
    'world? This map compares the average daily calorie supply ' +
    'per person across countries. Look for regional patterns, ' +
    'but also pay attention to neighboring countries with ' +
    'surprisingly different values. Agriculture, international ' +
    'trade, economic conditions, and food systems all influence ' +
    'the availability of food. Remember that national averages ' +
    'cannot tell us whether everyone has enough to eat. ' +
    'What important questions about food access and inequality ' +
    'remain unanswered by this map?'

    }

};


/* ==========================================
   MAP 2: DATA AND CURRENT SELECTION
   ========================================== */

const foodData = {};
const foodBreaks = {};

let countryLayer = null;
let selectedFood = 'All meat';

const noDataColor = '#D9D9D9';


/* ==========================================
   MAP 2: CSV COLUMN CLEANUP
   ========================================== */

// Remove extra spaces from CSV column names.
// This also fixes the "Unit " column heading.

function cleanCSVRow(row) {

    const cleaned = {};

    Object.keys(row).forEach(function(key) {
        cleaned[key.trim()] = row[key];
    });

    return cleaned;
}


/* ==========================================
   MAP 2: QUANTILE CLASS BREAKS
   ========================================== */

// Calculate a percentile from sorted numeric values.

function percentile(sortedValues, fraction) {

    const position = (sortedValues.length - 1) * fraction;
    const lower = Math.floor(position);
    const upper = Math.ceil(position);

    if (lower === upper) {
        return sortedValues[lower];
    }

    return sortedValues[lower] +
        (sortedValues[upper] - sortedValues[lower]) *
        (position - lower);
}


// Calculate four thresholds for five color classes.

function calculateBreaks(category) {

    const values = Object.values(foodData[category] || {})
        .map(record => record.value)
        .filter(Number.isFinite)
        .sort((a, b) => a - b);

    if (values.length === 0) {
        return [];
    }

    // Sugar cane: zero gets its own class.
    // Positive values are divided into four groups.

    if (category === 'Sugar cane') {

        const positive = values.filter(value => value > 0);

        if (positive.length === 0) {
            return [0, 0, 0, 0];
        }

        return [
            0,
            percentile(positive, 0.25),
            percentile(positive, 0.50),
            percentile(positive, 0.75)
        ];
    }

    return [
        percentile(values, 0.20),
        percentile(values, 0.40),
        percentile(values, 0.60),
        percentile(values, 0.80)
    ];
}


/* ==========================================
   MAP 2: COLOR CLASSIFICATION
   ========================================== */

function getFoodColor(value) {

    if (value === null || !Number.isFinite(value)) {
        return noDataColor;
    }

    const settings = foodSettings[selectedFood];
    const breaks = foodBreaks[selectedFood];

    if (!settings || !breaks || breaks.length !== 4) {
        return noDataColor;
    }

    if (value <= breaks[0]) return settings.colors[0];
    if (value <= breaks[1]) return settings.colors[1];
    if (value <= breaks[2]) return settings.colors[2];
    if (value <= breaks[3]) return settings.colors[3];

    return settings.colors[4];
}


/* ==========================================
   MAP 2: NUMBER AND UNIT FORMATTING
   ========================================== */

function formatFoodNumber(value) {

    return Number(value).toLocaleString('en-US', {
        maximumFractionDigits: 2
    });
}


function getFoodUnit(category) {

    if (category === 'Cheese') {
        return 'tonnes produced nationally';
    }

    if (category === 'Rice') {
        return 'grams per person per day';
    }

    return 'kcal per person per day';
}


/* ==========================================
   MAP 2: DYNAMIC LEGEND
   ========================================== */

function updateFoodLegend() {

    const legend = document.getElementById('map2-legend');

    if (!legend) return;

    const settings = foodSettings[selectedFood];
    const breaks = foodBreaks[selectedFood];

    if (!settings || !breaks || breaks.length !== 4) {
        legend.textContent = 'Legend unavailable.';
        return;
    }

    // Build the five class labels.

    let labels;

    if (selectedFood === 'Sugar cane') {

        labels = [
            'Exactly 0',
            'Above 0 to ' + formatFoodNumber(breaks[1]),
            'Above ' + formatFoodNumber(breaks[1]) +
                ' to ' + formatFoodNumber(breaks[2]),
            'Above ' + formatFoodNumber(breaks[2]) +
                ' to ' + formatFoodNumber(breaks[3]),
            'Above ' + formatFoodNumber(breaks[3])
        ];

    } else {

        labels = [
            'Up to ' + formatFoodNumber(breaks[0]),
            'Above ' + formatFoodNumber(breaks[0]) +
                ' to ' + formatFoodNumber(breaks[1]),
            'Above ' + formatFoodNumber(breaks[1]) +
                ' to ' + formatFoodNumber(breaks[2]),
            'Above ' + formatFoodNumber(breaks[2]) +
                ' to ' + formatFoodNumber(breaks[3]),
            'Above ' + formatFoodNumber(breaks[3])
        ];

    }

    // Clear the old legend.

    legend.replaceChildren();

    const heading = document.createElement('h3');
    heading.className = 'map2-legend-title';
    heading.textContent = settings.title + ' — 2023';
    legend.appendChild(heading);

    const unit = document.createElement('p');
    unit.className = 'map2-legend-unit';
    unit.textContent = getFoodUnit(selectedFood);
    legend.appendChild(unit);

    // Create the five color rows.

    settings.colors.forEach(function(color, index) {

        const row = document.createElement('div');
        row.className = 'map2-legend-row';

        const swatch = document.createElement('span');
        swatch.className = 'map2-legend-swatch';
        swatch.style.backgroundColor = color;
        swatch.setAttribute('aria-hidden', 'true');

        const label = document.createElement('span');
        label.textContent = labels[index];

        row.appendChild(swatch);
        row.appendChild(label);
        legend.appendChild(row);

    });

    // Add a separate gray swatch for missing data.

    const missingRow = document.createElement('div');
    missingRow.className = 'map2-legend-row';

    const missingSwatch = document.createElement('span');
    missingSwatch.className = 'map2-legend-swatch';
    missingSwatch.style.backgroundColor = noDataColor;
    missingSwatch.setAttribute('aria-hidden', 'true');

    const missingLabel = document.createElement('span');
    missingLabel.textContent = 'No data';

    missingRow.appendChild(missingSwatch);
    missingRow.appendChild(missingLabel);
    legend.appendChild(missingRow);


}


/* ==========================================
   MAP 2: EDUCATIONAL DESCRIPTION
   ========================================== */

function updateFoodDescription() {

    const description =
        document.getElementById('map2-description');

    if (!description) return;

    const settings = foodSettings[selectedFood];

    description.textContent = settings
        ? settings.description
        : 'Explore global food patterns using 2023 data.';
}


/* ==========================================
   MAP 2: UPDATE COUNTRY COLORS AND POPUPS
   ========================================== */

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

        // Build popup text safely using DOM elements.

        const popup = document.createElement('div');

        const heading = document.createElement('strong');
        heading.textContent = countryName;
        popup.appendChild(heading);

        const detail = document.createElement('p');
        detail.style.marginBottom = '0';

        if (record) {

            detail.textContent =
                foodSettings[selectedFood].title +
                ' (2023): ' +
                formatFoodNumber(record.value) + ' ' +
                getFoodUnit(selectedFood);

        } else {

            detail.textContent =
                'No data available for this statistic.';

        }

        popup.appendChild(detail);
        layer.bindPopup(popup);

    });

    updateFoodLegend();
    updateFoodDescription();
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

    const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
    });

    // Organize CSV records by category and country code.

    parsed.data.forEach(function(originalRow) {

        const row = cleanCSVRow(originalRow);

        const category =
            String(row['Food / Statistic'] || '').trim();

        const year =
            String(row['Year'] || '').trim();

        const iso =
            String(row['ISO Code'] || '').trim().toUpperCase();

        const rawValue =
            String(row['Value'] ?? '').trim();

        const value = Number(rawValue);

        if (
            foodSettings[category] &&
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
                unit: String(row['Unit'] || '').trim()
            };

        }

    });

    // Calculate class breaks for all categories.

    Object.keys(foodSettings).forEach(function(category) {
        foodBreaks[category] = calculateBreaks(category);
    });

    // Create country polygons once.
    // Reuse them whenever the selected statistic changes.

    countryLayer = L.geoJSON(countryGeoJSON).addTo(foodMap);

    // Display whichever radio button is selected.

    const checkedRadio = document.querySelector(
        'input[name="foodCategory"]:checked'
    );

    if (checkedRadio) {
        selectedFood = checkedRadio.value;
    }

    updateFoodMap();

    
    console.log('Available categories:', Object.keys(foodData));
    console.log('Calculated class breaks:', foodBreaks);

})

.catch(function(error) {
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

console.log('🍽️ Map 2 loaded up beautifully!');

