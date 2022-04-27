var greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [12, 20],
    iconAnchor: [6, 20],
    popupAnchor: [1, -17],
    shadowSize: [20, 20]
});

var url_billboards = './data/billboards.json';
var url_auto = './data/yelp_poi_phx_automotive.json';
var url_beauty = './data/yelp_poi_phx_beauty.json';

let config = {
    minZoom: 3,
    maxZoom: 18,
};

const zoom = 11;

// co-ordinates
const lat = 33.486402;
const lng = -112.099639;

// calling map
const map = L.map("mapdiv", config).setView([lat, lng], zoom);

//var osm = new L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//}).addTo(map);

var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});

var osm = Esri_WorldTopoMap.addTo(map);

// billboard layer
var billboards_lyr = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 3,
            color: '#000',
            fillColor: '#800080',
            weight: 0.5,
            fillOpacity: 1,
            opacity:50,
        }).bindTooltip('Billboard');
    },
});

$.getJSON(url_billboards, function (data) {
    billboards_lyr.addData(data).addTo(map);
});

// POIs automotive layer
var poi_auto_lyr = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 2,
            color: 'red',
            fillColor: 'red',
        }).bindTooltip('POI - Automotive');  //.bindTooltip(feature.properties.Name);
    },

    onEachFeature: function (feature, layer) {
        //layer._leaflet_id = feature.properties.Team;
        //var popupContent = "<p>The <b>" +
        //    feature.properties.Team + "</b> play here,</br> They are in the " +
        //    feature.properties.League + "</br>" +
        //    '<a href="' + feature.properties.Website + '" target="_blank">Website</a></p>';

        //if (feature.properties && feature.properties.popupContent) {
        //    popupContent += feature.properties.popupContent;
        //}
        //layer.bindPopup(popupContent);
    }
});

$.getJSON(url_auto, function (data) {
    poi_auto_lyr.addData(data);
});

// POIs beauty layer
var poi_beauty_lyr = L.geoJson(null, {

    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 2,
            color: 'blue',
            fillColor: 'blue',
        });
    },

    onEachFeature: function (feature, layer) {
        //layer._leaflet_id = feature.properties.Team;

        //var popupContent = "<p>The <b>" +
        //    feature.properties.Team + "</b> play here,</br> They are in the " +
        //    feature.properties.League + "</br>" +
        //    '<a href="' + feature.properties.Website + '" target="_blank">Website</a></p>';

        //if (feature.properties && feature.properties.popupContent) {
        //    popupContent += feature.properties.popupContent;
        //}
        //layer.bindPopup(popupContent);

    }
});

$.getJSON(url_beauty, function (data) {
    poi_beauty_lyr.addData(data);
});

// basemap layer
var baseMaps = {
    'Open StreetMap': osm
};

var overlayMaps = {
    'Billboards': billboards_lyr,
    'Automotive': poi_auto_lyr,
    'Beauty': poi_beauty_lyr,
};

L.control.layers(baseMaps, overlayMaps).addTo(map);

var group = L.layerGroup();
var pop_group = L.layerGroup();
var result_data;
const base_url = "http://localhost:5000/GetBillboardsMCLP?";

// bind events

$("#cal-coverage-btn").click(function () {

    group.addTo(map);

    btype_txt = $('#b-type-list').val();
    n_text = $('#nbillboard-input').val();
    radius_txt = $('#radius-input').val()

    request_url = base_url + "btype=" + btype_txt + "&n=" + n_text + "&radius=" + radius_txt + "&mode=prod";

    $.get(request_url, function (data, status) {

        //for debug
        console.log(data);
        result_data = data;

        var selected_billboards = JSON.parse(result_data.result);
        selected_billboards.forEach(function (element) {
            var marker = L.marker([element.lat, element.long]).addTo(group);
            var circle = L.circle([element.lat, element.long], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: parseInt(radius_txt),
                weight: 1,
            }).addTo(group);
        });

        $("#coverage-pct").text(result_data.covered_pct + " %");

    });
});

$("#cal-popcoverage-btn").click(function () {

    pop_group.addTo(map);

    btype_txt = "population";
    n_text = $('#nbillboard-input').val();
    radius_txt = $('#radius-input').val()

    request_url = base_url + "btype=" + btype_txt + "&n=" + n_text + "&radius=" + radius_txt + "&mode=prod";

    $.get(request_url, function (data, status) {

        //for debug
        console.log(data);
        result_data = data;

        var selected_billboards = JSON.parse(result_data.result);
        selected_billboards.forEach(function (element) {
            var marker = L.marker([element.lat, element.long], { icon: greenIcon }).addTo(pop_group);
            var circle = L.circle([element.lat, element.long], {
                color: 'green',
                fillColor: '#2AAD27',
                fillOpacity: 0.5,
                radius: parseInt(radius_txt),
                weight: 1,
            }).addTo(pop_group);
        });


    });
});

$('#clear-btn').click(function () {
    group.clearLayers();
    map.removeLayer(group);

    pop_group.clearLayers();
    map.removeLayer(pop_group);

    $("#coverage-pct").text("-- %");
});