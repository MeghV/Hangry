$(function() {
	var lat; // latitude of user
	var lng; // longitude of user 
	var latlng; // latitude/longitude object
	var geocoder; // Google geocoder
	var city; // name of user's city
	var map; // reference to map
	get_location(); // gets users location
	hoverFood(); // hover effect
	clickTile(); // tile click
}); //onload

// presents a message about what types of foods
// each mood corresponds to based on data-attributes
// that were set when moods were initialized
function hoverFood() {
	$(".list-item").hover(function() {
		var types = $(this).attr("data-type");
		var cats = $(this).attr("data-pretty");
		var string = "We'll look for " + types + " foods like " + cats;
		$(".type_foods").html(string);
		$(".type_foods").hide().appendTo($(".location")).fadeIn(500);
	}, function() {
		$(".type_foods").fadeOut();
	});
}

// presents a message about what types of foods
// each mood corresponds to based on data-attributes
// that were set when moods were initialized
function clickTile() {
	$(".list-item").click(function() {
		var cats = $(this).attr("data-categories");
		var img = $(this).attr("data-icon");
		console.log("looking for " + cats);
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
	for (i = 0; i < lastElement; i++) {
		populateTiles(moodsArr[i], i)
	}
	populateTiles(moodsArr[lastElement], lastElement);
}

// populates and appends elements within the tile, 
// including the mood and its corresponding image;
//    delay  - delay between consecutive tile fade-ins
//    number - nth-child of tiles list under which tile will be appended
function populateTiles(curr, number) {
	var mood = curr.mood;
	var img = curr.image;
	var cats = curr.categories;
	var pretty = curr.pretty_cats;
	var mapicon = curr.map_img;
	var type = curr.type;
	var tile = $(".templates .holder").clone();
	console.log(mood);
	tile.find("img").attr({
		"src": img,
		"title": "You're feelin' totally " + mood,
		"alt": mood + " face"
	});
	tile.find(".moodName").html(mood);
	var listItem = $(".tiles .list-item").eq(number);
	listItem.attr({
		"data-categories": cats,
		"data-pretty": pretty,
		"data-icon": mapicon,
		"data-type": type

	});
	tile.hide().appendTo(listItem).fadeIn(600);
}

// gets user location via browser geolocation
// calls for ip Address info as a back up
function get_location() {
	if (Modernizr.geolocation) {
		navigator.geolocation.getCurrentPosition(successFunction, geoFallback());
	} else {
		geoFallback();
	}
}

// upon geolocation success lat and lng are set and
// tiles are created
//   position - object containing user's coordinates
function successFunction(position) {
	lat = position.coords.latitude;
	lng = position.coords.longitude;
	console.log("Getting location");
	latlng = new google.maps.LatLng(lat, lng);
	codeLatLng(latlng);
	$("ul").slideDown(500, function() {
		createTiles(); // creates and fades in tiles
	});
	console.log("Ready to find!");
}

// uses ipinfo.io to find their city based on their ip;
// serves as fallback in case geolocation does not work,
// not as reliable as geolocation
//   error - problem!
function geoFallback(error) {
	$.get("http://ipinfo.io", function(response) {
		console.log(response.city, response.region);
		if (response.city != null || response.city != undefined) {
			updateMessage("How&#39;re you feelin&#39; over in <span id='city'>" + response.city + "</span> today?");
		}
	}, "jsonp");

}

// reverse geocodes based on user's latitiude and longitude
// and looks for the name of their city in Google's Geocode response
//   latlng - user's latitude/longitude
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
							updateMessage("How&#39;re you feelin&#39; over in <span id='city'>" + city + "</span> today?");
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
//   categories - the corresponding Yelp food categories of the chosen mood
//   image      - the mood's marker icon 
function afterSelection(categories, image) {
	$(".tiles, .type_foods").fadeOut(2);
	createMap(latlng);
	yelpTest(categories, image, latlng);

}

// creates the map object with options and styling
//   ll - latitude/longitude to center map on
function createMap(ll) {
	var mapOptions = {
		center: ll,
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		styles: [{
			"featureType": "water",
			"stylers": [{
				"color": "#19a0d8"
			}]
		}, {
			"featureType": "administrative",
			"elementType": "labels.text.stroke",
			"stylers": [{
				"color": "#ffffff"
			}, {
				"weight": 6
			}]
		}, {
			"featureType": "administrative",
			"elementType": "labels.text.fill",
			"stylers": [{
				"color": "#e85113"
			}]
		}, {
			"featureType": "road.highway",
			"elementType": "geometry.stroke",
			"stylers": [{
				"color": "#efe9e4"
			}, {
				"lightness": -40
			}]
		}, {
			"featureType": "road.arterial",
			"elementType": "geometry.stroke",
			"stylers": [{
				"color": "#efe9e4"
			}, {
				"lightness": -20
			}]
		}, {
			"featureType": "road",
			"elementType": "labels.text.stroke",
			"stylers": [{
				"lightness": 100
			}]
		}, {
			"featureType": "road",
			"elementType": "labels.text.fill",
			"stylers": [{
				"lightness": -100
			}]
		}, {
			"featureType": "road.highway",
			"elementType": "labels.icon"
		}, {
			"featureType": "landscape",
			"elementType": "labels",
			"stylers": [{
				"visibility": "off"
			}]
		}, {
			"featureType": "landscape",
			"stylers": [{
				"lightness": 20
			}, {
				"color": "#efe9e4"
			}]
		}, {
			"featureType": "landscape.man_made",
			"stylers": [{
				"visibility": "off"
			}]
		}, {
			"featureType": "water",
			"elementType": "labels.text.stroke",
			"stylers": [{
				"lightness": 100
			}]
		}, {
			"featureType": "water",
			"elementType": "labels.text.fill",
			"stylers": [{
				"lightness": -100
			}]
		}, {
			"featureType": "poi",
			"elementType": "labels.text.fill",
			"stylers": [{
				"hue": "#11ff00"
			}]
		}, {
			"featureType": "poi",
			"elementType": "labels.text.stroke",
			"stylers": [{
				"lightness": 100
			}]
		}, {
			"featureType": "poi",
			"elementType": "labels.icon",
			"stylers": [{
				"hue": "#4cff00"
			}, {
				"saturation": 58
			}]
		}, {
			"featureType": "poi",
			"elementType": "geometry",
			"stylers": [{
				"visibility": "on"
			}, {
				"color": "#f0e4d3"
			}]
		}, {
			"featureType": "road.highway",
			"elementType": "geometry.fill",
			"stylers": [{
				"color": "#efe9e4"
			}, {
				"lightness": -25
			}]
		}, {
			"featureType": "road.arterial",
			"elementType": "geometry.fill",
			"stylers": [{
				"color": "#efe9e4"
			}, {
				"lightness": -10
			}]
		}, {
			"featureType": "poi",
			"elementType": "labels",
			"stylers": [{
				"visibility": "simplified"
			}]
		}]
	}
	map = new google.maps.Map($('.map-container')[0], mapOptions);
}

// updates the location message
//   msg - the message that will be inserted into .message
function updateMessage(msg) {
	$('.message').hide().html(msg).fadeIn();
}
