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

	// $.each(mood, function(index, value) {
	// 	tile = $(".templates .list-item").clone();
	// 	alert(this);
	// 	var content = tile.find(".tile-4");
	// 	content.html(this);
	// 	$(".tiles").hide().append(tile).fadeIn();
	// });         
}); //onload