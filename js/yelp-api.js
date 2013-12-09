function yelpTest(categories) {
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
  var sort = 1;
  alert("Lat is " + lat);
  alert("Lng is " + lng);
  alert("Cats are " + categories);
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
      console.log(data);
      alert(data.businesses[0].id);
      geocode(data.businesses[0]);
      var output = prettyPrint(data);
    }
  });
}

function geocode(place) {
  geocoder.geocode({
      'address': place.location.address[0]
    },
    function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        alert("Geocoder OK " + place.location.address[0]);
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
        });
        updateMessage("You should go eat at " + place.name);
      }
    }
  );
}