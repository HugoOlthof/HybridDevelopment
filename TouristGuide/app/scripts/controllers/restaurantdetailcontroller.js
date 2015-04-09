angular.module('starter.controllers')

  .controller('RestaurantDetailController', function($scope, $rootScope, $timeout, $stateParams, $ionicTabsDelegate, Yelp) {

    // Get the clicked restaurant from the url
    $scope.restaurant = Yelp.getRestaurant($stateParams.restaurantId);

    // Favorite button click listener
    $scope.favoriteRes = function() {
      // If the restaurant is already favorited
      if ($scope.restaurant.favorite) {
        // Unfavorite restaurant
        $scope.restaurant.favorite = false;

        Yelp.favorite($scope.restaurant.id, false);
      }
      // If the restaurant is not favorited
      else {
        // Favorite restaurant
        $scope.restaurant.favorite = true;

        Yelp.favorite($scope.restaurant.id, true);
      }
    };

    // Show route button click listener
    $scope.showRoute = function() {
      // Go to the Map tab
      $ionicTabsDelegate.select(3);

      // Wait for the mapcontroller to load (if it's the first time the user goes to the Map)
      $timeout(function() {
        // Perform a "routeEvent" broadcast to the mapcontroller's listener
        $rootScope.$broadcast('routeEvent', $scope.restaurant.address + ', ' + $scope.restaurant.city);
      });
    };

  });
