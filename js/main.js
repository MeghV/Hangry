$(function() {
	sliderStyle(); // initializes slider
	var lat;
	var lng;
	var latlng;
	var geocoder;
	var city;
	var service;
	var map;
	get_location(); // gets users location

	clickTile();
	// tile.fadeIn(4000);


}); //onload

function clickTile() {
	$(".list-item").click(function() {
		var cats = $(this).attr("data-categories");
		var img = $(this).find("img").attr("src");
		console.log(cats);
		console.log(img);
		afterSelection(cats, img);
	});
}

// creates the elements that will be used in the tiles
// based on the moods object - they can be dynamically
// altered
function createTiles() {
	var moodsArr = moods;
	var i;
	var lastElement = moodsArr.length - 1;
	var delay;
	for (i = 0; i < lastElement; i++) {
		delay = 200 * i + 300;
		populateTiles(delay, moodsArr[i], i)
	}
	delay = 200 * lastElement + 300;
	populateTiles(delay, moodsArr[lastElement], lastElement);
}

// populates and appends elements within the tile, 
// including the mood and its corresponding image;
//    delay  - delay between consecutive tile fade-ins
//    mood   - specified mood
//    image  - specified image
//    number - nth-child of tiles list under which tile will be appended
function populateTiles(delay, curr, number) {
	var mood = curr.mood;
	var img = curr.image;
	var cats = curr.categories;
	var tile = $(".templates .holder").clone();
	console.log(mood);
	tile.find("img").attr({
		"src": img,
		"title": "You're feelin' totally " + mood,
		"alt": mood + " face"
	});
	tile.find(".moodName").html(mood);
	var listItem = $(".tiles .list-item").eq(number);
	listItem.attr("data-categories", cats)
	tile.hide().appendTo(listItem).delay(delay).fadeIn(2500);
}

// creates and styles the price slider 
// using jQuery UI slider pips plugn
function sliderStyle() {
	$('.price-sort-slider').slider({
		min: 1,
		max: 2,
		step: 1,
		animate: 'slow'
	});
	$('.price-sort-slider').slider('pips', {
		rest: "label",
		labels: ["Nearest", "Highest Rated"]
	});
}

function get_location() {
	if (Modernizr.geolocation) {
		navigator.geolocation.getCurrentPosition(successFunction, geoFallback());
	} else {
		geoFallback();
	}
}

function successFunction(position) {
	//$(".hiddenDiv").css("display", "none");
	lat = position.coords.latitude;
	lng = position.coords.longitude;
	console.log("Getting location");
	latlng = new google.maps.LatLng(lat, lng);
	codeLatLng(latlng);
	$("ul").slideDown();
	createTiles(); // creates and fades in tiles
	console.log("Ready to find!");
}

// uses ipinfo.io to find their city based on their ip;
// serves as fallback in case geolocation does not work,
// not as reliable as geolocation
function geoFallback(error) {
	console.log("geoFallback called");
	$.get("http://ipinfo.io", function(response) {
		console.log(response.city, response.region);
		if (response.city != null || response.city != undefined) {
			appendCity(response.city);
		}
	}, "jsonp");
	// $(".submit").click(function() {
	// 	var address = $(".submit-location").val();
	// 	//var value = select.val();
	// 	//var address = value.toString();
	// 	geocode(address);
	// })
}

// function geocode(address) {
// 	geocoder = new google.maps.Geocoder(); 
// 	geocoder.geocode({'address': address},
// 	function(results, status) {
// 		if (status == google.maps.GeocoderStatus.OK) {
// 		// latitude and longitude
// 			lat = results[0].geometry.location.nb;
// 			lng = results[0].geometry.location.ob;

// 			latlng = new google.maps.LatLng(lat, lng);
// 			successFunction2(latlng);
// 		}
// 	});
// }

// function successFunction2(latlng) {
// 	$(".hiddenDiv").css("display", "none");
// 	console.log("Getting location");
// 	codeLatLng(latlng);
// 	$("ul").slideDown();
// 	createTiles(); // creates and fades in tiles
// 	console.log("Ready to find!");
// }

function codeLatLng(latlng) {
	geocoder = new google.maps.Geocoder();
	geocoder.geocode({
		'latLng': latlng
	}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			console.log(results)
			if (results[1]) {
				//find country name
				for (var i = 0; i < results[0].address_components.length; i++) {
					for (var b = 0; b < results[0].address_components[i].types.length; b++) {
						//there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
						if (results[0].address_components[i].types[b] == "locality") {
							//this is the object you are looking for
							console.log(results[0].address_components[i].long_name);
							city = results[0].address_components[i].long_name;
							if ($("#city").html() !== city) {
								appendCity(city);
							}
							break;
						}
					}
				}
			} else {
				geoFallback();
			}
		} else {
			alert("Geocoder failed due to: " + status);
		}
	});
}

// fade out tiles and slider after tile chosen
function afterSelection(categories, image) {
	$(".tiles, .price-sort-slider").fadeOut();
	createMap(latlng);
	yelpTest(categories, image, latlng);
}
// creates the map object
function createMap(ll) {

	var mapOptions = {
		center: ll,
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		styles: [{"featureType": "water", "stylers": [{"color": "#19a0d8"}]},{"featureType": "administrative","elementType": "labels.text.stroke",
            "stylers": [{"color": "#ffffff"},{"weight": 6}]},{"featureType": "administrative", "elementType": "labels.text.fill","stylers": [{
            "color": "#e85113"}]},{"featureType": "road.highway","elementType": "geometry.stroke","stylers": [{"color": "#efe9e4"},{"lightness": -40
            }]},{"featureType": "road.arterial","elementType": "geometry.stroke","stylers": [{"color": "#efe9e4"},{"lightness": -20}]},{"featureType": "road",
            "elementType": "labels.text.stroke","stylers": [{"lightness": 100}]},{"featureType": "road","elementType": "labels.text.fill","stylers": [
            {"lightness": -100}]},{"featureType": "road.highway","elementType": "labels.icon"}, {"featureType": "landscape","elementType": "labels","stylers": [
            {"visibility": "off"}]},{"featureType": "landscape","stylers": [{"lightness": 20},{"color": "#efe9e4"}]},{"featureType": "landscape.man_made","stylers": [
            {"visibility": "off"}]},{"featureType": "water","elementType": "labels.text.stroke","stylers": [{"lightness": 100}]},{"featureType": "water",
            "elementType": "labels.text.fill","stylers": [{"lightness": -100}]},{"featureType": "poi","elementType": "labels.text.fill","stylers": 
            [{"hue": "#11ff00"}]},{"featureType": "poi","elementType": "labels.text.stroke","stylers": [{"lightness": 100}]},{"featureType": "poi",
            "elementType": "labels.icon","stylers": [{"hue": "#4cff00"},{"saturation": 58}]},{"featureType": "poi","elementType": "geometry","stylers": [
            {"visibility": "on"},{"color": "#f0e4d3"}]},{"featureType": "road.highway","elementType": "geometry.fill","stylers": [{"color": "#efe9e4"},{
            "lightness": -25}]},{"featureType": "road.arterial","elementType": "geometry.fill","stylers": [{"color": "#efe9e4"}, {"lightness": -10}]},{
            "featureType": "poi","elementType": "labels","stylers": [{"visibility": "simplified"}]}]}

	map = new google.maps.Map($('.map-container')[0], mapOptions);
}

function appendCity(city) {
	$("#city").hide().html(city).fadeIn();
}

function onGeoError(err) {
	updateMessage("Sorry, your shit is BROKEN SUCKA!");
}

function updateMessage(msg) {
	$('.message').hide().html(msg).fadeIn();
}