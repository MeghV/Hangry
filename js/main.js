$(function() {
	var moodsArr = moods;
	var tile;
	var i;
	for (i = 0; i < moodsArr.length - 1; i++) {
		var mood = moodsArr[i];
		tile = $(".templates > .list-item").clone();
		// alert(mood);
		console.log(mood);
		var content = tile.find(".tile-4");
		console.log(content.html());
		content.html(mood);
		// tile.hide();
		tile.appendTo(".tiles");
		// tile.fadeIn(4000);
	}
	var finalMood = moodsArr[moodsArr.length - 1];
	tile = $(".templates .list-item").clone();
	console.log(finalMood);
	tile.attr("id", "last");
	var content = tile.find(".tile-4");
	content.html(finalMood);
	// tile.hide();
	tile.appendTo(".tiles");
	// tile.fadeIn(4000);
	var geocoder;
	var city;
	get_location();
}); //onload

function get_location() {
	console.log("Getting location");
	if (Modernizr.geolocation) {
		navigator.geolocation.getCurrentPosition(successFunction);
	} else {
		// no native support; maybe try a fallback?
	}
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
				$.get("http://ipinfo.io", function(response) {
					console.log(response.city, response.country);
					$("#city").hide().html(city).fadeIn();
				}, "jsonp");
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