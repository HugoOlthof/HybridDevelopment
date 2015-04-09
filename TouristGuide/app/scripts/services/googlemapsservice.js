angular.module('starter.services')

  .factory('GoogleMaps', function(Location) {

    // Default map options when the map is getting initialized
    var mapOptions = {
      zoom: 15,
      center: new google.maps.LatLng(Location.latitude(), Location.longitude()),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };

    // Construct a map
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Construct a spider view when multiple markers exist on one place
    var oms = new OverlappingMarkerSpiderfier(map);

    var geocoder = new google.maps.Geocoder();

    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();

    directionsDisplay.setMap(map);

    // The markers on the map
    var yourLocationMarker = [];
    var photoMarkers = [];

    // The window when a marker is tapped
    var infoWindow = new google.maps.InfoWindow({
      maxWidth: 200
    });

    // Create a marker on your current position
    var createYourLocationMarker = function() {
      // Construct a marker
      var marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(Location.latitude(), Location.longitude()),
        title: 'Your location'
      });

      // Set the marker content
      marker.content = '<div class="infoWindowContent"></div>';

      google.maps.event.addListener(marker, 'click', function(){
        infoWindow.setContent('<h4>' + marker.title + '</h4>' + marker.content);
        infoWindow.open(map, marker);
      });

      // Add the marker to the list of markers
      yourLocationMarker.push(marker);
    };

    // Create a marker on your current position
    var createPhotoMarker = function (lat, long, title, url){
      // Construct a marker
      var marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(lat, long),
        title: title
      });

      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');

      // Set the marker content
      marker.content = '<img style="width:99%;height:auto;" src='+url+'>';

      // Add marker to the spider view
      oms.addMarker(marker);

      // Add the marker to the list of markers
      photoMarkers.push(marker);
    };

    // Bind a click listener on the marker
    oms.addListener('click', function(marker, event) {
      if(marker.title) {
        infoWindow.setContent('<h4>' + marker.title + '</h4>' + marker.content);
      }
      else {
        infoWindow.setContent('<h4>' + 'No title' + '</h4>' + marker.content);
      }
      infoWindow.open(map, marker);
    });

    oms.addListener('spiderfy', function(markers) {
      infoWindow.close();
    });

    // Calculate a route to the given address
    var calculateRoute = function (address) {
      removeRoutes();

      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var target = results[0].geometry.location;

          var start = Location.latitude() + ',' + Location.longitude();
          var end = target.k + ',' + target.D;

          var request = {
            origin: start,
            destination: end,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.TRANSIT
          };

          directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);
            }
          });
        }
      });

    };

    // Deletes all markers in the array by removing references to them
    function deleteMarkers() {
      for (var i = 0; i < yourLocationMarker.length; i++) {
        yourLocationMarker[i].setMap(null);
      }
      yourLocationMarker = [];
    }

    // Removes the calculated route
    function removeRoutes() {
      directionsDisplay.setDirections({routes: []});
    }

    return {
      createMap: function() {
        deleteMarkers();
        removeRoutes();
        createYourLocationMarker();
      },
      createPhotoMarkers: function(lat, long, title, url) {
        createPhotoMarker(lat, long, title, url)
      },
      calcRoute: function(address) {
        calculateRoute(address);
      }
    };
  }

);
