$(function() {
	createTiles(); // creates and fades in tiles
	sliderStyle(); // initializes slider
	// tile.fadeIn(4000);
	var lat;
	var lng;
	var geocoder;
	var city;
	var service;
	var map;
	get_location();
}); //onload

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
		min: 0,
		max: 3,
		step: 1,
		animate: 'slow'
	});
	$('.price-sort-slider').slider('pips', {
		rest: "label",
		labels: ["$", "$$", "$$$", "$$$$"]
	});
}

function get_location() {
	if (Modernizr.geolocation) {
		navigator.geolocation.getCurrentPosition(successFunction, handle_error);
	} else {
		geoFallback();
	}
}

function handle_error(err) {
	if (err.code == 1) {
		console.log("User said no!");
		geoFallback();
	}
}
// uses ipinfo.io to find their city based on their ip;
// serves as fallback in case geolocation does not work,
// not as reliable as geolocation
function geoFallback() {
	console.log("geoFallback called");
	$.get("http://ipinfo.io", function(response) {
		console.log(response.city, response.region);
		$("#city").hide().html(response.city).fadeIn();
	}, "jsonp");
}

function successFunction(position) {
	lat = position.coords.latitude;
	lng = position.coords.longitude;
	console.log("Getting location");
	var latlng = new google.maps.LatLng(lat, lng);
	alert(latlng);
	codeLatLng(latlng);
	onGeoSuccess(latlng);
	var chosen = $("#last").attr("data-categories");
    yelpTest(chosen);
}

function codeLatLng(latlng) {
	geocoder = new google.maps.Geocoder();
	geocoder.geocode({
		'latLng': latlng
	}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			console.log(results)
			if (results[1]) {
				//formatted address
				alert(results[0].formatted_address)
				//find country name
				for (var i = 0; i < results[0].address_components.length; i++) {
					for (var b = 0; b < results[0].address_components[i].types.length; b++) {
						//there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
						if (results[0].address_components[i].types[b] == "locality") {
							//this is the object you are looking for
							alert(results[0].address_components[i].long_name);
							city = results[0].address_components[i].long_name;
							$("#city").hide().html(city).fadeIn();
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

function onGeoSuccess(ll) {
	$(".tiles, .price-sort-slider").fadeOut();
	var mapOptions = {
		center: ll,
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	map = new google.maps.Map($('.map-container')[0], mapOptions);

	var marker = new google.maps.Marker({
		map: map,
		position: ll,
		title: 'You are here!'
	});

	var request = {
		location: ll,
		radius: '10000',
		types: ['stores']
	};

	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(request, callback);

}

function callback(results, status) {
  var stores = [];
  console.log("Made the callback");
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    console.log("Places Service Status ok");
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      stores.push(place.name);
    }
    console.log(stores.toString());
  } else {
  	console.log("Places Service Status not OK");
  }
}

function onGeoError(err) {
	updateMessage("Sorry, your shit is BROKEN SUCKA!");
}

function updateMessage(msg) {
	$('.message').html(msg);
}