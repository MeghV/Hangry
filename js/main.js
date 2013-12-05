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
		tile.hide();
		tile.appendTo(".tiles");
		tile.fadeIn(4000);
	}
	var finalMood = moodsArr[moodsArr.length - 1];
	tile = $(".templates .list-item").clone();
	console.log(finalMood);
	tile.attr("id", "last");
	var content = tile.find(".tile-4");
	content.html(finalMood);
	tile.hide();
	tile.appendTo(".tiles");
	tile.fadeIn(4000);

	get_location();
	$.get("http://ipinfo.io", function(response) {
    	console.log(response.ip, response.city);
    	$("#city").empty().hide().html(response.city).fadeIn('slow');
	}, "jsonp");
	// $.each(mood, function(index, value) {
	// 	tile = $(".templates .list-item").clone();
	// 	alert(this);
	// 	var content = tile.find(".tile-4");
	// 	content.html(this);
	// 	$(".tiles").hide().append(tile).fadeIn();
	// });         
}); //onload

function get_location() {
	console.log("Getting location");
	if (Modernizr.geolocation) {
		navigator.geolocation.getCurrentPosition(alertCoords);
	} else {
		// no native support; maybe try a fallback?
	}
}

function alertCoords(position) {
	  var latitude = position.coords.latitude;
  	var longitude = position.coords.longitude;
  	alert(latitude + ", " + longitude);
}