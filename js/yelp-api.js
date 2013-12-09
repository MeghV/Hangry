var i = 0;
var markers = [];
var businesses;
var image;
var directionsDisplay;

function yelpTest(categories, face, origin) {
  image = face;
  var auth = {
    // Update with your auth tokens.
    consumerKey: "_Lo_S_1nCTJrPZvdk_z5ag",
    consumerSecret: "qZ1RfZaRmRw_y1SmddAYRvScPM4",
    accessToken: "CvFx-ZxZew2d3uQb3SnPxfshQhiwUux6",
    // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
    // You wouldn't actually want to expose your access token secret like this in a real application.
    accessTokenSecret: "QvSJbzeNK3Rlzhh4KQaBZ1ctmKA",
    serviceProvider: {
      signatureMethod: "HMAC-SHA1"
    }
  };

  var terms = 'food';
  var location = lat + "," + lng;
  var radius = 10000;
  var sort = $('.price-sort-slider').slider("value");
  var accessor = {
    consumerSecret: auth.consumerSecret,
    tokenSecret: auth.accessTokenSecret
  };

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

  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);

  var parameterMap = OAuth.getParameterMap(message.parameters);
  parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
  console.log(parameterMap);

  $.ajax({
    'url': message.action,
    'data': parameterMap,
    'cache': true,
    'dataType': 'jsonp',
    'jsonpCallback': 'cb',
    'success': function(data, textStats, XMLHttpRequest) {
      businesses = data.businesses;
      randomize();
      console.log(businesses);
      geocode(data.businesses[0], image);
      $(".myButton").fadeIn().click(function() {
        nextPlace();
      });
    }
  });
}

function nextPlace() {
  i++;
  if(i === businesses.length) {
    i = 0;
  }
  var place = businesses[i];
  geocode(place);
}

function geocode(place) {
  for (i in markers) {
    markers[i].setMap(null);
    directionsDisplay.setMap(null);
  }
  var loc = place.location;
  var address = loc.address[0] + ", " + loc.city;
  geocoder.geocode({
      'address': address
    },
    function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var dest = results[0].geometry.location;
        alert("Geocoder OK " + loc.address[0]);
        addMarker(dest);
        updateMessage("You should go eat at " + place.name);
      }
    }
  );
}

function addMarker(destination) {
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);
  var directionsService = new google.maps.DirectionsService();
  var img = {
    url: image,
    scaledSize: new google.maps.Size(40, 40, "px", "px")
  };
  var marker = new google.maps.Marker({
    map: map,
    position: destination,
    icon: img,
    animation: google.maps.Animation.DROP
  });
  marker.setAnimation(google.maps.Animation.BOUNCE);

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
  markers.push(marker);
}

function geocoderrr(place, image, origin) {
  var directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);
  var directionsService = new google.maps.DirectionsService();
  geocoder.geocode({
      'address': place.location.address[0]
    },
    function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        alert("Geocoder OK " + place.location.address[0]);
        var request = {
          origin: latlng,
          destination: results[0].geometry.location,
          travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function(result, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
          }
        });
        var img = {
          url: image,
          scaledSize: new google.maps.Size(40, 40, "px", "px")
        };
        var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          icon: img,
          animation: google.maps.Animation.DROP
        });
        marker.setAnimation(google.maps.Animation.BOUNCE);
        updateMessage("You should go eat at " + place.name);
      }
    }
  );
}

function randomize() {
  businesses.sort(function() {
    return 0.5 - Math.random()
  });
}