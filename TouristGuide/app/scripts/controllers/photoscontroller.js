angular.module('starter.controllers')

  .controller('PhotosController', function($scope, Flickr, Location, $ionicPopup) {

    $scope.photosLeft = [];
    $scope.photosRight = [];

    $scope.images = [];

    // Watch for a change in the photo list
    $scope.$watch(function () {
        return Flickr.onPhotosChange();
      },
      function(newVal, oldVal) {
        // When the variable changes, set that variable in the photo lists
        var temp = JSON.parse(newVal);
        var temp2 = temp.splice(0, temp.length / 2);

        $scope.photosLeft = temp2;
        $scope.photosRight = temp;
      }, true);

    // Initialize a popup, used for to favorite or unfavorite a photo
    $scope.showConfirm = function(photo) {
      var confirmPopup = $ionicPopup.confirm({
        title: photo.title,
        template: '<img ng-src='+photo.url+' style="width:100%; height:auto">',
        okText: photo.favorite && "Unfavorite" || "Favorite",
        cancelText: "Hide",
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
