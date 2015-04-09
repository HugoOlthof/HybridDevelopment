angular.module('starter.services')

  .factory('Location', function(Yelp, Flickr) {

    var latitude;
    var longitude;

    // Get the user's current position
    function getPosition() {
      navigator.geolocation.getCurrentPosition(onSuccess);
    };

    var onSuccess = function(position) {
      // Set the position's latitude and longitude
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

      // Get all the restaurants and photos with the retrieved lat & long
      Yelp.getAllRestaurants(latitude,longitude);
      Flickr.getPhotos(latitude,longitude);
    };

    return {
      getCurrentLocation: function() {
        getPosition();
      },
      latitude: function() {
        return latitude;
      },
      longitude: function() {
        return longitude;
      }
    };
  });
