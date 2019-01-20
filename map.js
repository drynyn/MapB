	//===================
	//global var
	//===================
    var polylineDistance = 0;
    var workingPolyline=L.polyline([],);
    var noOfMeterToPixel = 128;
    var toolFunction = "";
	var centerlatlng = L.latLng([0,0]);// = L.latLng([1539,1035]);
	var mapURL = "mapB.png";
	var mapNoLines = "Map_B_NoLines.png";

	//custom markers

	//not used atm
	var bullseye = L.icon({
		iconUrl: 'target.png',
		iconSize:     [30, 30], // size of the icon
		iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
	});

//===================
//map setup
//===================
//var bounds = [[0, 0], [2048,2048]];
var bounds = [[-1539,-1035], [2048-1539,2048-1035]];

var map = L.map("map", { crs: L.CRS.Simple,
							minZoom: -1,
						 });
map.fitBounds(bounds);
map.setView([0, 0], 1);

//===================
//Make Layer Objects
//===================

//image overlays for base maps
var imagedetailed = L.imageOverlay(mapURL, bounds)
var image = L.imageOverlay(mapNoLines, bounds); 
map.addLayer(image);//adds map image to map object as default

//the base map options
var baseMaps = {
"Default": image,
"Detailed": imagedetailed
}; 

//setting up layer groups

var duchyGroup = L.geoJSON();
var kingdomGroup =  L.geoJSON();
var graticuleGroup = L.layerGroup();
var acreGraticuleGroup = L.layerGroup();


//feature group for added markers, for easy clearing
var markers = new L.FeatureGroup();
map.addLayer(markers);

var overlays = {"Dutchies": duchyGroup,
			"Kingdoms": kingdomGroup,
		"Graticule": graticuleGroup,
		"Acre Graticle (slow)" : acreGraticuleGroup
	};

L.control.layers( baseMaps, overlays, {position: 'topleft'}).addTo(map);

function duchyClick(){
	alert('click');
}

//enable some layers by default
map.addLayer(graticuleGroup);
map.addLayer(kingdomGroup);

//parsing duchy geojsons
L.geoJSON(duchyGeo, {
	style: function (feature) {
		return feature.properties && feature.properties.style;
	},
	onEachFeature: onEachDuchyFeature
    }
).addTo(duchyGroup);

function onEachDuchyFeature(feature, layer) {
	layer.bindTooltip(feature.properties.kingdomRef + ': ' + feature.properties.popupContent);
}

//parsing kingdom geojson (atm we cheat by using the duchy geojson)
L.geoJSON(kingdomGeo, {
	style: function (feature) {
		return feature.properties && feature.properties.style;
	},
	onEachFeature: onEachKingdomFeature
    }
).addTo(kingdomGroup);

function onEachKingdomFeature(feature, layer) {
	layer.bindTooltip(feature.properties.duchyRef + ': ' + feature.properties.popupContent);

}

//===================
//Set up map events
//===================
	map.on('click', (e)=>{this.onMapClick(e)});

//===================
//Sidepanel
//===================
// create the sidebar instance and add it to the map
var sidebar = L.control.sidebar({ container: 'sidebar', position: 'right' })
	.addTo(map)

	sidebar.addPanel({
		id:   'spacer1',
		tab:  ' Tabs ',
		title: '',
	})

	sidebar.addPanel({
		id:   'home',
		tab:  '<img class = "toolbar-icon" src="./images/home.svg" alt="H" > ',
		title: '',
	})
	sidebar.addPanel({
		id:   'details',
		tab:  '<img class = "toolbar-icon" src="./images/info.svg" alt="I"> ',
		title: '',
	})
	sidebar.addPanel({
		id:   'importexport',
		tab: '<img class = "toolbar-icon" src="./images/save.svg" alt="S" > ',
		title: '',
	})

	sidebar.addPanel({
		id:   'spacer2',
		tab:  ' Tools ',
		title: '',
	})

//Here we have the tool buttons
sidebar.addPanel({
	id:   'handtool',
	tab: '<img class = "toolbar-icon" src="./images/hand.svg" alt="H"> ',
	title: 'Hand Tool',
	button: function() {
		enableLayerClicks(duchyGroup); //need to disable to click through layers
		toolFunction = "";
	}
})
sidebar.addPanel({
		id:   'measure',
		tab:  ' <img class = "toolbar-icon" src="./images/distanceIcon.png" alt="Ms"> ',
		title: 'Measure',
		button: function() {
			polylineDistance = 0;
			workingPolyline=L.polyline([],{color: 'red', weight: 5});
			toolFunction = "measure";
			disableLayerClicks(duchyGroup); //need to disable to click through layers
		},
	})
sidebar.addPanel({
	id:   'marker',
	tab:  ' <img class = "toolbar-icon" src="./images/Marker.png" alt="Mk"> ',
	title: 'Place Marker',
	button: function() {toolFunction = "marker";
	disableLayerClicks(duchyGroup); //need to disable to click through layers
},
})
sidebar.addPanel({
	id:   'clearmarkers',
	tab:  ' <img class = "toolbar-icon" src="./images/trash.svg" alt="C"> ',
	title: 'Clear All',
	button: function() {clearMarkers();},
})

//Disables our spacing 'sidebars'
sidebar.disablePanel('spacer1');
sidebar.disablePanel('spacer2');

//===================
//Create controls
//===================

//origin lines
L.circle(centerlatlng, {radius: 3, fill:false, color:'black'}).addTo(map);
L.circle(centerlatlng, {radius: 1, fill:false, color:'black'}).addTo(map);
var polyline = L.polyline([[centerlatlng.lat, bounds[0][1]],	[centerlatlng.lat, bounds[1][1]],],{color:'black', weight:1}).addTo(map); 
var polyline = L.polyline([[bounds[0][0], centerlatlng.lng],	[bounds[1][0], centerlatlng.lng],],{color:'black', weight:1}).addTo(map); 
 
/* Moved to the sidebar
//Measurement button
L.Control.measureButton = L.Control.extend({
onAdd: function(map) {
	var measureButton = L.DomUtil.create('button');
	//measureButton.style.width = '50';
	//measureButton.style.height = '50';
	L.DomEvent.disableClickPropagation(measureButton);
	measureButton.onclick = () => {
		polylineDistance = 0;
		workingPolyline=L.polyline([],{color: 'red', weight: 5});
		toolFunction = "measure";
	}
	measureButton.innerHTML = 'Measure';

	return measureButton;
},

onRemove: function(map) {
	// Nothing to do here
}
});

L.control.measureButton = function(opts) {
return new L.Control.measureButton(opts);
}
	
//Marker button
L.Control.markerButton = L.Control.extend({
	onAdd: function(map) {
		var markerButton = L.DomUtil.create('button');
		L.DomEvent.disableClickPropagation(markerButton);
		markerButton.onclick = () => {
			toolFunction = "marker";
		}
		markerButton.innerHTML = 'Marker';

		return markerButton;
	},

	onRemove: function(map) {
		// Nothing to do here
	}
});	

L.control.markerButton = function(opts) {
	return new L.Control.markerButton(opts);
}

//Clear button
L.Control.clearButton = L.Control.extend({
	onAdd: function(map) {
		var clearButton = L.DomUtil.create('button');
		L.DomEvent.disableClickPropagation(clearButton);
		clearButton.onclick = () => {
			clearMarkers();
		}
		clearButton.innerHTML = 'Clear';

		return clearButton;
	},

	onRemove: function(map) {
		// Nothing to do here
	}
});	

L.control.clearButton = function(opts) {
	return new L.Control.clearButton(opts);
}

	//Add all controls to map
	L.control.measureButton({ position: 'topright' }).addTo(map);
	L.control.markerButton({ position: 'topright' }).addTo(map);
	L.control.clearButton({ position: 'topright' }).addTo(map);
	*/

	//===================	 
	//map functions
	//===================	 
	function onMapClick(e) {
		switch (toolFunction) {
			case 'marker':
			placeMarker (e.latlng);
            break;
            case 'measure':
                placeMeasurePolyline(e.latlng);
			break;
            default:
              //No default
          }
	}
    //===================
    //Map Click Functions
    //===================
    function placeMarker (latlng) {
		var translatlng = translateSimpleToRealCoord(latlng);
		var popupText = 'Coord: ' + translatlng.lat.toFixed(2) + ', ' + translatlng.lng.toFixed(2)
		var marker = L.marker(latlng);

		marker.bindPopup(popupText + ' ' + "</br><input type='button' value='Delete' class='marker-delete-button'/>");
		marker.on("popupopen", onMarkerPopupOpen);
		marker.addTo(markers);
		return marker;		
		}
	
	//handles events for marker popup
	function onMarkerPopupOpen() {
		var tempMarker = this;
	
		// To remove marker on click of delete button in the popup of marker
		$(".marker-delete-button:visible").click(function () {
			map.removeLayer(tempMarker);
		});
	}

    function placeMeasurePolyline(latlng){

		//extend polyline
        workingPolyline.addLatLng(latlng).addTo(markers);
		
		//make marker at end of line
        var marker = L.marker(latlng).addTo(markers);

        //bind pop up text
		var popupStringLine = 'Total Distance: ' +       (sumPolylineDistance(workingPolyline) * noOfMeterToPixel).toFixed(2) + ' km ' + getPolyCoords(workingPolyline);
		var popupStringMarker = 'Distance to marker: ' + (sumPolylineDistance(workingPolyline) * noOfMeterToPixel).toFixed(2) + ' km';
		//bind popups
        workingPolyline.bindPopup(popupStringLine);
        marker.bindPopup(popupStringMarker);
	}
	
	function clearMarkers(){
		markers.clearLayers();
		polylineDistance = 0;
		workingPolyline=L.polyline([],{color: 'red', weight: 5});
	}
    
    //===================
    //Helper Functions
	//===================
	
	//turn off click events on groups layers, doesnt works with how i have made the geojson layers
	function disableLayerClicks(group){
		group.eachLayer(function (layer) {
			layer.off('click', this.openPopup);
		});
	}

	//turn on click events on groups layers, doesnt works with how i have made the geojson layers
	function enableLayerClicks(group){
		group.eachLayer(function (layer) {
			layer.on('click',  function (e) {
				this.openPopup();
			});
		});
	}

	function disableLayerPopups(group){
		group.eachLayer(function (layer) {
		})
	}

	function setupLayerPopups(group){
		group.eachLayer(function (layer) {
		})
	}

	//turns a polyline into coords
	function getPolyCoords(polyline){
		var latlngs = polyline.getLatLngs();
        var textResult;

        latlngs.forEach(function (latlngs, index) {
            if (index > 0){
                //textResult += ' ['+latlngs.lat+ ' , ' + latlngs.lng+']' + ' , \r ';
				//For geojsons 
				textResult += ' ['+latlngs.lng+ ' , ' + latlngs.lat+']' + ' , \r ';
            }
        });
        
        return textResult;
	}

	//this turns map coords into game coords, i,e translates from 0,0 to whatever is in centerlatlng
	// not needed really now since I now determine 0,0 via the bounding box
	function translateSimpleToRealCoord(latlng){
		var lat;
		var lng;
		lat = latlng.lat - centerlatlng.lat;
		lng = latlng.lng - centerlatlng.lng;
		
		return  L.latLng([lat,lng]);
	}

	//flat cos the world is flat probably
	function flatDistanceTo(latlngA, latlngB){
		var x1 = latlngA.lat;
		var y1 = latlngA.lng;
		var x2 = latlngB.lat;
		var y2 = latlngB.lng;
		
		return Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);
    }
    
    function sumPolylineDistance(polyline){
        var latlngs = polyline.getLatLngs();
        var runningTotal = 0;
        var previousLatlng = []; 

        latlngs.forEach(function (latlngs, index) {
            if (index > 0){
                runningTotal += flatDistanceTo(previousLatlng, latlngs);                
            }
            previousLatlng = latlngs;
        });
        
        return runningTotal;
    }

/*
	var plottedPolyline = L.Polyline.Plotter([
			[1324,998],
			[1344, 1020],		
			[1338, 1038],
			[1340, 1066],
			[1350,1080],
			[1352, 1108],
			[1340, 1140],
			[1322, 1090],
			[1278, 1056],
			[1270, 1016],
			[1278,986]
	],{
		weight: 5
	}).addTo(map);
 var xxx = L.latLng([1539,1035]);


	plottedPolyline.addLatLng(xxx).addTo(map);
*/

///////////////////
//Setup of Graticle
//////////////////
var optionsGraticle = {
		interval: 40,
		showOriginLabel: true,
		redraw: 'move',
		};

L.simpleGraticule(optionsGraticle).addTo(graticuleGroup);


//Acre Graticle
var optionsAcre = {
	interval: 1,
	showOriginLabel: true,
	redraw: 'move',
	};

L.simpleGraticule(optionsAcre).addTo(acreGraticuleGroup);




//on draw function, to get polygon coords.
map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    if (type === 'polygon') {
        // here you got the polygon points
        var points = layer._latlngs;
        // here you can get it in geojson format
        var geojson = layer.toGeoJSON();
   }
   // here you add it to a layer to display it in the map
   drawnItems.addLayer(layer);
});
