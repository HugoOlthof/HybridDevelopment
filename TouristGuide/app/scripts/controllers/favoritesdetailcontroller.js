angular.module('starter.controllers')

  .controller('FavoritesDetailController', function($scope, $rootScope, $stateParams, $ionicPopup, $ionicTabsDelegate, $timeout, Yelp, Storage) {

    $scope.restaurant;

    // Get all restaurant favorites from localstorage
    var fromStorage = Storage.getAllRestaurantFavorites();

    // If localstorage is not empty
    if(fromStorage) {
      fromStorage = JSON.parse(fromStorage);
      for(var i = 0; i < fromStorage.length; i++) {
        // If id in localstorage matches the id in the stateParam (url)
        if(fromStorage[i].id === $stateParams.restaurantId) {
          // Set the restaurant
          $scope.restaurant = fromStorage[i];
        }
      }
    }

    // Favorite button click listener
    $scope.favoriteRes = function() {
      if ($scope.restaurant.favorite) {
        $scope.restaurant.favorite = false;

        Yelp.favorite($scope.restaurant.id, false);
      }
    };

    // Show route button click listener
    $scope.showRoute = function() {
      // Check for network connection
      if(window.Connection) {
        if(navigator.connection.type == Connection.NONE) {
          $ionicPopup.confirm({
            title: 'No Internet Connection',
            content: 'Sorry, no Internet connectivity detected. Maps is not available.'
          });
        }
        else {
          // Go to the Map tab
          $ionicTabsDelegate.select(3);

          // Wait for the mapcontroller to load (if it's the first time the user goes to the Map)
          $timeout(function() {
            // Perform a "routeEvent" broadcast to the mapcontroller's listener
            $rootScope.$broadcast('routeEvent', $scope.restaurant.address + ', ' + $scope.restaurant.city);
          });
        }
      }
    };

  });
