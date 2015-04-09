angular.module('starter.controllers')

  .controller('MapController', function ($scope, $http, $ionicPopup, GoogleMaps, Flickr) {

    if(window.Connection) {
      if (navigator.connection.type == Connection.NONE) {
        $ionicPopup.confirm({
          title: 'No Internet Connection',
          content: 'Sorry, no Internet connectivity detected. Maps is not available.'
        });
      }
    }

    // Initialize the map
    GoogleMaps.createMap();

    // Get all photos
    var photos = JSON.parse(Flickr.onPhotosChange());

    // For every photo in the list, do a http request to retrieve the photo's location
    // If the requests succeeds: Create a marker on the Map
    for(var i = 0; i < photos.length; i++) {
      (function(i) {
        $http.get('https://api.flickr.com/services/rest/?method=flickr.photos.geo.getLocation&api_key=f590e0892dcf0e86324f6994616806e3&'+
        'photo_id='+photos[i].id+'&format=json&nojsoncallback=1')
          .success(function(data) {
            var data = data.photo.location;
            GoogleMaps.createPhotoMarkers(data.latitude, data.longitude, photos[i].title, photos[i].url);
          });
      })(i);
    }

    // When a "routeEvent" broadcast is sent (routeEvent is broadcasted from the restaurant detail views)
    $scope.$on('routeEvent', function(event, args) {
      // Create the route from your current location to the restaurant
      GoogleMaps.calcRoute(args);
    });

  });
