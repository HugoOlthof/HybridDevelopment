angular.module('starter.controllers')

  .controller('FavoritesController', function($scope, Yelp, Flickr, $ionicPopup) {

    $scope.restFavorites = [];

    $scope.photFavoritesLeft = [];
    $scope.photFavoritesRight = [];

    // Set view's default values
    $scope.show = true;
    $scope.buttonText = 'Photos';

    Yelp.getAllFavorites();
    Flickr.getAllFavorites();

    //Change view on button click
    $scope.changeView = function() {
      if($scope.show) {
        $scope.show = false;
        $scope.buttonText = 'Restaurants';
      }
      else {
        $scope.show = true;
        $scope.buttonText = 'Photos';
      }
    };

    // Watch for a change in the restaurant favorites list
    $scope.$watch(function () {
        return Yelp.onFavoritesChange();
      },
      function(newVal, oldVal) {
        // When something has changed, set that new value in the scope's restaurant favorites list
        var temp = JSON.parse(newVal);
        if(temp.length > 0) {
          $scope.restFavorites = JSON.parse(newVal);
        }
        else {
          $scope.restFavorites = [];
        }
      }, true);

    // Watch for a change in the photo favorites list
    $scope.$watch(function () {
        return Flickr.onFavoritesChange();
      },
      function(newVal, oldVal) {
        // When something has changed, set that new value in the scope's photo favorites list
        var temp = JSON.parse(newVal);
        if(temp.length > 0) {
          var temp = JSON.parse(newVal);
          var temp2 = temp.splice(0, temp.length / 2);

          $scope.photFavoritesLeft = temp2;
          $scope.photFavoritesRight = temp;
        }
        else {
          $scope.photFavoritesLeft = [];
          $scope.photFavoritesRight = [];
        }
      }, true);

    // Initialize a popup, used for to favorite or unfavorite a photo
    $scope.showConfirm = function(photo) {
      var confirmPopup = $ionicPopup.confirm({
        title: photo.title,
        template: '<img ng-src='+photo.url+' style="width:100%; height:auto">',
        okText: photo.favorite && "Unfavorite" || "Favorite",
        okType: 'button-assertive'
      });

      // If button is clicked
      confirmPopup.then(function(positive) {
        if(positive) {
          // If photo is already favorited
          if(photo.favorite) {
            // Unfavorite photo
            Flickr.favorite(photo.id, false);
          }
          // If photo is not already favorited
          else {
            // Favorite photo
            Flickr.favorite(photo.id, true);
          }
        }
        else {
          //Canceled
        }
      });
    };
  });
