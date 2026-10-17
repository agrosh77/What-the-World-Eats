
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

