var i = 0; // incrementer to go through businesses as user clicks next
var markers = []; // markers on map
var infowindows = []; // infowindows on map
var businesses; // array of businesses returned from Yelp
var image; // image to use as marker icon
var directionsDisplay; // used to display route on map

// based on user's mood selection, creates parameters
// and GETs response from Yelp Search API corresponding
// to those parameters;
//   -categories - the Yelp food categories associated with each mood
//   -face       - the image associated with each mood
function yelpTest(categories, face) {
  image = face;
  var auth = {
    // yelp API authentication
    consumerKey: "_Lo_S_1nCTJrPZvdk_z5ag",
    consumerSecret: "qZ1RfZaRmRw_y1SmddAYRvScPM4",
    accessToken: "CvFx-ZxZew2d3uQb3SnPxfshQhiwUux6",
    accessTokenSecret: "QvSJbzeNK3Rlzhh4KQaBZ1ctmKA",
    serviceProvider: {
      signatureMethod: "HMAC-SHA1"
    }
  };

  // yelp request terms
  var terms = 'food';
  var location = lat + "," + lng;
  var radius = 10000;
  var sort = 1;
  var accessor = {
    consumerSecret: auth.consumerSecret,
    tokenSecret: auth.accessTokenSecret
  };

  // creates parameters for Yelp API request
  parameters = [];
  parameters.push(['term', terms]);
  parameters.push(['ll', location]);
  parameters.push(['category_filter', categories]);
  parameters.push(['sort', sort]);
  parameters.push(['radius_filter', radius]);
  parameters.push(['callback', 'cb']);
  parameters.push(['oauth_consumer_key', auth.consumerKey]);
  parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
  parameters.push(['oauth_token', auth.accessToken]);
  parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

  var message = {
    'action': 'http://api.yelp.com/v2/search',
    'method': 'GET',
    'parameters': parameters
  };

  // OAuth stuff
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  var parameterMap = OAuth.getParameterMap(message.parameters);
  parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)

  // getting results based on request
  $.ajax({
    'url': message.action,
    'data': parameterMap,
    'cache': true,
    'dataType': 'jsonp',
    'jsonpCallback': 'cb',
    'success': function(data, textStats, XMLHttpRequest) {
      businesses = data.businesses; // sets businesses to returned businesses
      randomize(); // randomize array of results
      console.log(businesses);
      geocode(data.businesses[i], image); // geocodes business based on index
      $(".myButton").fadeIn().click(function() {
        nextPlace();
      });
    }
  });
}

// increments the array and geocodes next business 
function nextPlace() {
  i++;
  if (i === businesses.length) {
    i = 0;
  }
  var place = businesses[i];
  geocode(place);
}

// based on the current place where i is in the businesses array,
// sets a marker and maps route
//   place - current place being examined (businesses[i])
function geocode(place) {
  // removes existing markers
  for (i in markers) {
    markers[i].setMap(null);
    directionsDisplay.setMap(null);
  }
  // removes existing infowindows
  infowindows = [];

  var loc = place.location;
  var address = loc.address[0] + ", " + loc.city;
  // geocodes based on business' address
  geocoder.geocode({
      'address': address
    },
    function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var dest = results[0].geometry.location;
        addMarker(dest, place); // adds marker on business
        changeToMiles(place); // calculates distnance
        // sets distance text contextually
        var distanceText;
        if (place.distance > 1) {
          distanceText = ", it's only like " + place.distance + " miles away.";
        } else if (place.distance < 1) {
          distanceText = ", it's less than 1 mile away.";
        } else {
          distanceText = ", it's like " + place.distance + " mile away!";
        }
        // updates message with restuarant name and distance
        updateMessage("You should go eat at " + "<a class='directions' href='" + place.url + "' target='_blank'>" + place.name + "</a>" + distanceText);
      }
    }
  );
}

// adds a marker based on coordinates of restarurant
//   destination - the location info of the restaurant (lat, lng)
//   place       - reference to the specific place object to object other info
function addMarker(destination, place) {
  // creates visual route to place
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);
  var directionsService = new google.maps.DirectionsService();
  var request = {
    origin: latlng,
    destination: destination,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(result);
    }
  });

  // creates marker with custom icon on place
  var img = {
    url: image,
    scaledSize: new google.maps.Size(40, 40, "px", "px")
  };
  var marker = new google.maps.Marker({
    map: map,
    position: destination,
    icon: img
  });

  marker.setAnimation(google.maps.Animation.BOUNCE);
  markers.push(marker);

  // creates infowindow for marker with Yelp rating
  var nm = place.name;
  console.log(nm);
  var stars = place.rating_img_url;
  var contentString = "<em>" + nm + "</em> is rated <img src=" + stars + "> on Yelp!";
  var infowindow = new google.maps.InfoWindow({
    content: contentString,
    maxWidth: 800
  });

  // opens and closes infowindow based on hover state
  google.maps.event.addListener(marker, 'mouseover', function() {
    infowindow.open(map, marker);
  });
  google.maps.event.addListener(marker, 'mouseout', function() {
    infowindow.close();
  });
  infowindows.push(infowindow);
}

// converts the distance to the place from meters
// to miles and then uses Math.floor/Math.ceil
// to make it a whole number depending on if it's
// <= 0.5 
//   place - reference to restaurant's object with contextual info
function changeToMiles(place) {
  var distance = place.distance;
  distance = distance / 1609.34;
  var integer = Math.floor(distance);
  var decimal = distance - integer;
  if (decimal <= 0.5) {
    distance = Math.floor(distance);
  } else {
    distance = Math.ceil(distance);
  }
  place.distance = distance;
}

// randomizes the array of returned businesses
// so there's a different result each time
function randomize() {
  businesses.sort(function() {
    return 0.5 - Math.random()
  });
}