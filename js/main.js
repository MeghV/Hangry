$(function() {
	createTiles(); // creates and fades in tiles
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

	// tile.fadeIn(4000);
	var geocoder;
	var city;
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
		populateTiles(delay, moodsArr[i].mood, moodsArr[i].image, i)
	}
	delay = 200 * lastElement + 300;
	populateTiles(delay, moodsArr[lastElement].mood, moodsArr[lastElement].image, lastElement);
}

// populates and appends elements within the tile, 
// including the mood and its corresponding image;
//    delay  - delay between consecutive tile fade-ins
//    mood   - specified mood
//    image  - specified image
//    number - nth-child of tiles list under which tile will be appended
function populateTiles(delay, mood, image, number) {
	var mood = mood;
	var img = image;
	var tile = $(".templates .holder").clone();
	console.log(mood);
	tile.find("img").attr({
		"src": img,
		"title": "You're feelin' totally " + mood,
		"alt": mood + " face"
	});
	tile.find(".moodName").html(mood);
	tile.hide().appendTo($(".tiles .list-item").eq(number)).delay(delay).fadeIn(2500);
}

function get_location() {
	console.log("Getting location");
	if (Modernizr.geolocation) {
		navigator.geolocation.getCurrentPosition(successFunction);
	} else {
		geoFallback();
	}
}

// uses ipinfo.io to find their city based on their ip;
// serves as fallback in case geolocation does not work,
// not as reliable as geolocation
function geoFallback() {
	$.get("http://ipinfo.io", function(response) {
		console.log(response.city, response.country);
		$("#city").hide().html(city).fadeIn();
	}, "jsonp");
}

function successFunction(position) {
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	alert(lat + ", " + lng);
	codeLatLng(lat, lng);
}

function codeLatLng(lat, lng) {
	var latlng = new google.maps.LatLng(lat, lng);
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

function onGeoSuccess(position) {
	var ll = new google.maps.LatLng(position.coords.latitude,
		position.coords.longitude);

	var mapOptions = {
		center: ll,
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	var map = new google.maps.Map($('.map-container')[0], mapOptions);

	var marker = new google.maps.Marker({
		map: map,
		position: ll,
		title: 'You are here!'
	});

	updateMessage("You should go eat at");

}

function onGeoError(err) {
	updateMessage("Sorry, your shit is BROKEN SUCKA!");
}

function updateMessage(msg) {
	$('.map-message').html(msg);
}