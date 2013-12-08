$(function() {
	populateTiles();
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

function populateTiles() {
	var moodsArr = moods;
	var tile;
	var i;
	var lastElement = moodsArr.length - 1;
	for (i = 0; i < lastElement; i++) {
		delay = 200 * i + 300;
		var mood = moodsArr[i].mood;
		var img = moodsArr[i].image;
		tile = $(".templates .holder").clone();
		console.log(mood);
		tile.find("img").attr("src", img);
		tile.find(".moodName").html(mood);
		tile.hide().appendTo($(".tiles .list-item").eq(i)).delay(delay).fadeIn(2500);
	}
	delay = 200 * lastElement + 300;
	var finalMood = moodsArr[lastElement].mood;
	var finalImg = moodsArr[lastElement].image;
	tile = $(".templates .holder").clone();
	console.log(finalMood);
	tile.find("img").attr("src", finalImg);
	tile.find(".moodName").html(finalMood);
	tile.hide().appendTo($(".tiles .list-item").eq(lastElement)).delay(delay).fadeIn(2500);
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