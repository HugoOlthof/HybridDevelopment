angular.module('starter.controllers')

  .controller('RestaurantController', function($scope, Yelp, Location) {
    $scope.restaurants = [];

    $scope.rOrder = 'distance';

    $scope.reverse = false;

    // Get the user's current location,
    // The callback function does the Yelp API call to get the restaurants
    Location.getCurrentLocation();

    // Watch for a change in the restaurants variable in the yelpservice
    $scope.$watch(function () {
        return Yelp.onRestaurantsChange();
      },
      function(newVal, oldVal) {
        // When the variable changes, set that variable in the $scope.restaurants
        $scope.restaurants = JSON.parse(newVal);
      }, true);

  });
