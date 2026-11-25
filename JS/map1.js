
/* =========================================================
   MAP 1: THE GLOBAL FOOD EXPLORER
   What the World Eats?
   
   Hey, Marcus!

   This file controls the interactive map for Map 1.

   THE DEETS:

   1. You research traditional foods around the world.
   2. You enter that information into our Google Sheet.
   3. You download the sheet as a CSV file.
   4. You upload the CSV to GitHub.
   5. This JavaScript reads the CSV and creates the map.

   You do NOT need to write JavaScript for every country.

   Look for the comments marked "MARCUS" to see where
   you can make changes. You can also delete the commentary 
   as you clean the code up later.

   ========================================================= */


/* =========================================================
   SECTION 1: CREATE THE MAP
   =========================================================

   MARCUS:
   We're using Leaflet to create our interactive maps.

   The name "map1-map" connects this JavaScript to the
   HTML element with id="map1-map".

   The coordinates [15, 0] center the map near the equator.

   The number 2 is the starting zoom level.

   You can experiment with these values later.
   ========================================================= */

const map1 = L.map('map1-map', {
    worldCopyJump: true,
    scrollWheelZoom: false
}).setView([15, 0], 2);


/* =========================================================
   SECTION 2: ADD THE BASEMAP
   =========================================================

   MARCUS:
   This is the background map.

   We're using the same Esri World Topographic Map
   as Maps 2 and 3 so the website looks consistent.

   You do not need to change this section.
   ========================================================= */

L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 17
    }
).addTo(map1);

setTimeout(() => map1.invalidateSize(), 200);


/* =========================================================
   SECTION 3: MAP COLORS
   =========================================================

   MARCUS:
   These colors match our "vintage museum" vibe.

   Gold = Countries with food information
   Parchment = Countries without food information
   Garnet = Country borders

   You can experiment if you want to.
   ========================================================= */

const map1Colors = {
    noData: '#E9D9B8',
    border: '#51483F',
    selected: '#24476A'
};

const map1RegionColors = {
    'North America': '#35669A',
    'South America': '#449C87',
    'Europe': '#80569E',
    'Africa': '#D4A13E',
    'Asia': '#A44260',
    'Oceania': '#CB7952'
};

function map1GetColor(iso) {
    const data = map1FoodData[iso];

    return data
        ? map1RegionColors[String(data.Continent || "").trim()] || map1Colors.noData
        : map1Colors.noData;
}


/* =========================================================
   SECTION 4: STORE THE DATA
   =========================================================

   MARCUS:
   These variables will hold information from the CSV
   and the world GeoJSON file.

   GeoJSON contains the shapes of countries.

   CSV contains the food information.

   The ISO country code connects the two datasets.

   Example:
   Mexico = MEX
   Japan = JPN
   Ghana = GHA

   Do not change these variable names.
   ========================================================= */

let map1FoodData = {};
let map1WorldGeoJSON = null;
let map1CountryLayer = null;


/* =========================================================
   SECTION 5: KEEP POPUP TEXT SAFE
   =========================================================

   MARCUS:
   This function makes sure special characters from
   the spreadsheet display safely in HTML.

   You do not need to edit this section.
   ========================================================= */

function map1EscapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}



/* =========================================================
   SECTION 6: BUILD COUNTRY INFORMATION
   ========================================================= */

// Remove dollar amounts from agricultural trade data.
function map1CleanTrade(value) {
    return String(value || '')
        .replace(/\s*\(\s*\$[^)]*\)/g, '')
        .replace(/\bRice, broken\b/gi, 'Broken rice')
        .replace(/\bCoffee, green\b/gi, 'Unroasted coffee beans')
        .replace(/\bFigs, dried\b/gi, 'Dried figs')
        .replace(/\bHazelnuts, shelled\b/gi, 'Shelled hazelnuts')
        .replace(/\bOlives, preserved\b/gi, 'Preserved olives')
        .trim();
}

/* ISO alpha-3 to alpha-2 lookup for Unicode flags. */
const map1FlagCodes = {"ABW": "AW", "AFG": "AF", "AGO": "AO", "AIA": "AI", "ALA": "AX", "ALB": "AL", "AND": "AD", "ARE": "AE", "ARG": "AR", "ARM": "AM", "ASM": "AS", "ATA": "AQ", "ATF": "TF", "ATG": "AG", "AUS": "AU", "AUT": "AT", "AZE": "AZ", "BDI": "BI", "BEL": "BE", "BEN": "BJ", "BES": "BQ", "BFA": "BF", "BGD": "BD", "BGR": "BG", "BHR": "BH", "BHS": "BS", "BIH": "BA", "BLM": "BL", "BLR": "BY", "BLZ": "BZ", "BMU": "BM", "BOL": "BO", "BRA": "BR", "BRB": "BB", "BRN": "BN", "BTN": "BT", "BVT": "BV", "BWA": "BW", "CAF": "CF", "CAN": "CA", "CCK": "CC", "CHE": "CH", "CHL": "CL", "CHN": "CN", "CIV": "CI", "CMR": "CM", "COD": "CD", "COG": "CG", "COK": "CK", "COL": "CO", "COM": "KM", "CPV": "CV", "CRI": "CR", "CUB": "CU", "CUW": "CW", "CXR": "CX", "CYM": "KY", "CYP": "CY", "CZE": "CZ", "DEU": "DE", "DJI": "DJ", "DMA": "DM", "DNK": "DK", "DOM": "DO", "DZA": "DZ", "ECU": "EC", "EGY": "EG", "ERI": "ER", "ESH": "EH", "ESP": "ES", "EST": "EE", "ETH": "ET", "FIN": "FI", "FJI": "FJ", "FLK": "FK", "FRA": "FR", "FRO": "FO", "FSM": "FM", "GAB": "GA", "GBR": "GB", "GEO": "GE", "GGY": "GG", "GHA": "GH", "GIB": "GI", "GIN": "GN", "GLP": "GP", "GMB": "GM", "GNB": "GW", "GNQ": "GQ", "GRC": "GR", "GRD": "GD", "GRL": "GL", "GTM": "GT", "GUF": "GF", "GUM": "GU", "GUY": "GY", "HKG": "HK", "HMD": "HM", "HND": "HN", "HRV": "HR", "HTI": "HT", "HUN": "HU", "IDN": "ID", "IMN": "IM", "IND": "IN", "IOT": "IO", "IRL": "IE", "IRN": "IR", "IRQ": "IQ", "ISL": "IS", "ISR": "IL", "ITA": "IT", "JAM": "JM", "JEY": "JE", "JOR": "JO", "JPN": "JP", "KAZ": "KZ", "KEN": "KE", "KGZ": "KG", "KHM": "KH", "KIR": "KI", "KNA": "KN", "KOR": "KR", "KWT": "KW", "LAO": "LA", "LBN": "LB", "LBR": "LR", "LBY": "LY", "LCA": "LC", "LIE": "LI", "LKA": "LK", "LSO": "LS", "LTU": "LT", "LUX": "LU", "LVA": "LV", "MAC": "MO", "MAF": "MF", "MAR": "MA", "MCO": "MC", "MDA": "MD", "MDG": "MG", "MDV": "MV", "MEX": "MX", "MHL": "MH", "MKD": "MK", "MLI": "ML", "MLT": "MT", "MMR": "MM", "MNE": "ME", "MNG": "MN", "MNP": "MP", "MOZ": "MZ", "MRT": "MR", "MSR": "MS", "MTQ": "MQ", "MUS": "MU", "MWI": "MW", "MYS": "MY", "MYT": "YT", "NAM": "NA", "NCL": "NC", "NER": "NE", "NFK": "NF", "NGA": "NG", "NIC": "NI", "NIU": "NU", "NLD": "NL", "NOR": "NO", "NPL": "NP", "NRU": "NR", "NZL": "NZ", "OMN": "OM", "PAK": "PK", "PAN": "PA", "PCN": "PN", "PER": "PE", "PHL": "PH", "PLW": "PW", "PNG": "PG", "POL": "PL", "PRI": "PR", "PRK": "KP", "PRT": "PT", "PRY": "PY", "PSE": "PS", "PYF": "PF", "QAT": "QA", "REU": "RE", "ROU": "RO", "RUS": "RU", "RWA": "RW", "SAU": "SA", "SDN": "SD", "SEN": "SN", "SGP": "SG", "SGS": "GS", "SHN": "SH", "SJM": "SJ", "SLB": "SB", "SLE": "SL", "SLV": "SV", "SMR": "SM", "SOM": "SO", "SPM": "PM", "SRB": "RS", "SSD": "SS", "STP": "ST", "SUR": "SR", "SVK": "SK", "SVN": "SI", "SWE": "SE", "SWZ": "SZ", "SXM": "SX", "SYC": "SC", "SYR": "SY", "TCA": "TC", "TCD": "TD", "TGO": "TG", "THA": "TH", "TJK": "TJ", "TKL": "TK", "TKM": "TM", "TLS": "TL", "TON": "TO", "TTO": "TT", "TUN": "TN", "TUR": "TR", "TUV": "TV", "TWN": "TW", "TZA": "TZ", "UGA": "UG", "UKR": "UA", "UMI": "UM", "URY": "UY", "USA": "US", "UZB": "UZ", "VAT": "VA", "VCT": "VC", "VEN": "VE", "VGB": "VG", "VIR": "VI", "VNM": "VN", "VUT": "VU", "WLF": "WF", "WSM": "WS", "XKX": "XK", "YEM": "YE", "ZAF": "ZA", "ZMB": "ZM", "ZWE": "ZW"};

function map1Flag(iso) {
    const code = map1FlagCodes[iso];
    return code ? `<img src="https://flagcdn.com/w80/${code.toLowerCase()}.png" alt="" onerror="this.hidden=true">` : "";
}

// Format country information for the popup.
function map1BuildCountryHTML(data) {

    const dish = data['Popular Dishes'];
    const description = data['Popular Dishes Details'];

    const imports = map1CleanTrade(
        data['Important Agricultural Imports']
    );

    const exports = map1CleanTrade(
        data['Important Agricultural Exports']
    );

    const recipe = String(data['Recipe Link'] || '').trim();

    // Only display a recipe link if a valid web link exists.
    const recipeHTML = /^https?:\/\/[^\s]+$/i.test(recipe)
        ? `<a href="${map1EscapeHTML(recipe)}"
              target="_blank"
              rel="noopener noreferrer">Recipe</a>`
        : '';

    return `
        <div class="map1-country-popup">

            <h3>${map1EscapeHTML(data.Country)}</h3>
            <div class="map1-flag" aria-hidden="true">${map1Flag(data.ISO)}</div>
            <div class="map1-continent">${map1EscapeHTML(data.Continent)}</div>
            <hr>

            <div class="map1-dish-label">Popular Dish</div>
            <div class="map1-dish-name">${map1EscapeHTML(dish)}</div>

            <p>${map1EscapeHTML(description)}</p>

            ${recipeHTML}

            <hr>

            <strong>Foods they buy:</strong>
            ${map1EscapeHTML(imports)}
            <div class="map1-trade-gap"></div>

            <strong>Foods they sell:</strong>
            ${map1EscapeHTML(exports)}

        </div>
    `;
}



/* =========================================================
   SECTION 7: SELECT A COUNTRY
   =========================================================

   MARCUS:
   This function runs when someone chooses a country
   from the dropdown or clicks a highlighted country.

   (Hopefully) it will:
   - Update the information panel.
   - Highlight the selected country.
   - Open its popup.
   - Move the map toward that country.

   You do not need to edit this section yet.
   ========================================================= */

function map1SelectCountry(isoCode) {

    const data = map1FoodData[isoCode];

    if (!data || !map1CountryLayer) {
        return;
    }

    const dropdown = document.getElementById(
        'map1-country-select'
    );

dropdown.value = isoCode;

    map1CountryLayer.eachLayer(layer => {

        const layerISO =
            layer.feature.properties.iso_a3;

        const layerData = map1FoodData[layerISO];

        layer.setStyle({
    fillColor: map1GetColor(layerISO),
    color: layerISO === isoCode
        ? map1Colors.selected
        : map1Colors.border,
    weight: layerISO === isoCode ? 3 : 0.7,
    fillOpacity: layerISO === isoCode
        ? 0.95
        : 0.8
});

        if (layerISO === isoCode) {

            const bounds = layer.getBounds();

            if (bounds.isValid()) {
                map1.fitBounds(bounds, {
                    paddingTopLeft: [40, 160],
                    paddingBottomRight: [40, 40],
                    maxZoom: 4,
                    animate: false
                });
            }

            layer.openPopup();
        }
    });
}


/* =========================================================
   SECTION 8: CREATE THE COUNTRY LAYER
   =========================================================

   MARCUS:
   This draws the country boundaries using GeoJSON.

   Countries with spreadsheet data are colored gold.

   Countries without data remain parchment-colored.

   Clicking a country with data opens its information.

   You do not need to edit this section yet.
   ========================================================= */

function map1DrawCountries() {

    if (map1CountryLayer) {
        map1.removeLayer(map1CountryLayer);
    }

    map1CountryLayer = L.geoJSON(map1WorldGeoJSON, {

        style: feature => {

            const iso =
                feature.properties.iso_a3;

            const hasData = Boolean(map1FoodData[iso]);

            return {
    color: map1Colors.border,
    weight: 0.7,
    fillColor: map1GetColor(iso),
    fillOpacity: 0.8
};
        },

        onEachFeature: (feature, layer) => {

            const iso = feature.properties.iso_a3;
            const data = map1FoodData[iso];

            if (data) {

                layer.bindPopup(
                    map1BuildCountryHTML(data),
                    { maxWidth: 320, minWidth: 220, maxHeight: 310, autoPan: true, keepInView: true, autoPanPaddingTopLeft: [55, 25], autoPanPaddingBottomRight: [25, 25] }
                );

                layer.on('click', () => {
                    map1SelectCountry(iso);
                });
            }
        }

    }).addTo(map1);
}


/* =========================================================
   SECTION 9: FILL THE COUNTRY DROPDOWN
   =========================================================

   MARCUS:
   The dropdown is created automatically.

   If you add more countries to the spreadsheet,
   they will appear here after you upload the CSV.

   The list is sorted alphabetically.

   No need to add countries manually to the HTML.
   ========================================================= */

function map1PopulateDropdown() {

    const dropdown = document.getElementById(
        'map1-country-select'
    );

    dropdown.innerHTML =
        '<option value="">Choose a country...</option>';

    const countries = Object.values(map1FoodData)
        .sort((a, b) =>
            a.Country.localeCompare(b.Country)
        );

    countries.forEach(country => {

        const option = document.createElement('option');

        option.value = country.ISO;
        option.textContent = country.Country;

        dropdown.appendChild(option);
    });

    dropdown.addEventListener('change', () => {

        if (dropdown.value) {
            map1SelectCountry(dropdown.value);
        }
    });
}


/* =========================================================
   SECTION 10: LOAD THE SPREADSHEET AND COUNTRY SHAPES
   =========================================================

   MARCUS:
   THIS IS THE MOST IMPORTANT SECTION FOR YOUR DATA!

   Your Google Sheet must be downloaded as a CSV file.

   Name the file:

   map1_foods.csv

   Upload it to the Data folder in GitHub.

   Your project should look like this:

   Data/
       map1_foods.csv
       world-countries.geojson

   JS/
       map1.js
       map2.js
       map3.js

   Every time you update your research:
   1. Edit the Google Sheet.
   2. Download the sheet as CSV.
   3. Replace map1_foods.csv on GitHub.
   4. Refresh the website.

   ========================================================= */

Promise.all([

    fetch('Data/map1_foods.csv')
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'Could not load Map 1 food data'
                );
            }

            return response.text();
        }),

    fetch('Data/world-countries.geojson')
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'Could not load country boundaries'
                );
            }

            return response.json();
        })

])

.then(([csvText, worldGeoJSON]) => {

    const rows = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
    }).data;

    map1WorldGeoJSON = worldGeoJSON;

    
    rows.forEach(row => {

        const iso = String(row['ISO Code'] || '')
            .trim()
            .toUpperCase();

        const countryName = String(row.Country || '')
            .trim();

        // Check whether the country has researched food data.
        const hasFoodInformation = [
            row['Popular Dishes'],
            row['Popular Dishes Details'],
            row['Important Agricultural Imports'],
            row['Important Agricultural Exports']
        ].some(value => String(value || '').trim());

        // Match the spreadsheet to the GeoJSON country shapes.
        if (/^[A-Z]{3}$/.test(iso) &&
            countryName &&
            hasFoodInformation) {

            row.ISO = iso;
            row.Country = countryName;

            map1FoodData[iso] = row;
        }
    });



    map1DrawCountries();
    map1PopulateDropdown();

    console.log(
        `🍽️ Map 1 is serving up some yummy data! ${Object.keys(map1FoodData).length} countries loaded!`
    );

})

.catch(error => {

    console.error(
        '❌ Map 1 is not working, back to the code yo!:',
        error
    );
});
