angular.module('starter.services')

  .factory('Flickr', function($http, Storage) {

    var photos = [];
    var favorites = [];

    // A remove function
    Array.prototype.remove = function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
    };

    // Synchronize the unfavorited photo with the photo's list
    // When a photo is unfavorited, the original photo list needs to be informed
    // to change its values
    function syncUnFavorites(thePhoto) {
      var photTemp = JSON.parse(photos);

      for (var i = 0; i < photTemp.length; i++) {
        if(photTemp[i].id === thePhoto) {
          photTemp[i].favorite = false;
        }
      }
      photos = JSON.stringify(photTemp);
    }

    // Synchronize the favorited photo with the photo's list
    // When a photo is favorited, the original photo list needs to be informed
    // to change its values
    function syncFavorites() {
      var photTemp = JSON.parse(photos);
      var favTemp = JSON.parse(favorites);

      for (var i = 0; i < favTemp.length; i++) {
        for (var j = 0; j < photTemp.length; j++) {
          if (favTemp[i].id === photTemp[j].id) {
            photTemp[j].favorite = true;
          }
        }
      }
      photos = JSON.stringify(photTemp);
      favorites = JSON.stringify(favTemp);
    }

    // Parses the retrieved JSON into a photo object and pushes it to the photo list
    var parser = function(data) {
      var temp = data.photos.photo;

      for (var i = 0; (i < temp.length && i < 50); i++) {
        var url = 'https://farm'+temp[i].farm+'.staticflickr.com/'+temp[i].server+'/'+temp[i].id+'_'+temp[i].secret+'.jpg';
        var title = temp[i].title;
        var id = temp[i].id;
        var photo =
        {
          id: id,
          title: title,
          url: url,
          favorite: false
        };

        photos.push(photo);
      }
    };

    return {
      "getPhotos": function (latitude, longitude) {
        // Perform a http request to retrieve photos based on the user's location
        $http.get('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=f590e0892dcf0e86324f6994616806e3&lat='
        +latitude+'&lon='+longitude+'&format=json&nojsoncallback=1')
          // If the request succeeds
          .success(function(data) {
            // Parse the data
            parser(data);

            photos = JSON.stringify(photos);

            // Get the photo favorites from localstorage
            var fromStorage = Storage.getAllPhotoFavorites();
            if(fromStorage) {
              favorites = fromStorage;
            }
            else {
              favorites = JSON.stringify(favorites);
            }

            // Synchronize favorites list with photo list
            syncFavorites();
          });
      },
      onPhotosChange: function () {
        return photos;
      },
      onFavoritesChange: function () {
        return favorites;
      },
      getAllFavorites: function () {
        var fromStorage = Storage.getAllPhotoFavorites();
        if(fromStorage) {
          favorites = fromStorage;
        }
      },
      favorite: function (photoId, isFavorite) {
        // If isFavorite is false (user wants to unfavorite a photo)
        if(!isFavorite) {
          var favTemp = JSON.parse(favorites);

          // Get photo favorites from localstorage
          var fromStorage = Storage.getAllPhotoFavorites();

          fromStorage = JSON.parse(fromStorage);

          // Get the index of the objects from the lists so we can remove the objects
          var indexOfPhotoInStorage = fromStorage.map(function(el) { return el.id; }).indexOf(photoId);
          var indexOfPhotoInFavorites = favTemp.map(function(el) { return el.id; }).indexOf(photoId);

          // Remove photo from the localstorage list and the favorites list with the indices
          fromStorage.remove(indexOfPhotoInStorage);
          favTemp.remove(indexOfPhotoInFavorites);

          // Remove photo from localstorage
          Storage.removePhotoFromFavorites(fromStorage);

          // Apply changes for the existing favorites list
          favorites = JSON.stringify(favTemp);

          // Synchronize favorites list with photo list
          syncUnFavorites(photoId);
        }
        // If isFavorite is true (user wants to favorite a photo)
        else {
          var photTemp = JSON.parse(photos);
          var favTemp = JSON.parse(favorites);

          // Search for the photo object which matches to the photo ID
          for (var i = 0; i < photTemp.length; i++) {
            if (photTemp[i].id === photoId) {
              photTemp[i].favorite = isFavorite;

              // Get photo favorites from localstorage
              var fromStorage = Storage.getAllPhotoFavorites();

              // If there is something in localstorage
              if (fromStorage) {
                fromStorage = JSON.parse(fromStorage);

                // Add photo to the localstorage list and the favorites list
                fromStorage.push(photTemp[i]);
                favTemp.push(photTemp[i]);

                // Save photo to localstorage
                Storage.addPhotoToFavorites(fromStorage);

                // Apply changes for the existing favorites list
                favorites = JSON.stringify(favTemp);

                // Synchronize favorites list with photo list
                syncFavorites();
              }
              // If localstorage is empty
              else {
                favTemp.push(photTemp[i]);

                // Save photo to localstorage
                Storage.addPhotoToFavorites(favTemp);

                // Apply changes for the existing favorites list
                favorites = JSON.stringify(favTemp);

                // Synchronize favorites list with photo list
                syncFavorites();
              }

              return;
            }
          }
        }
      }
    };

  }
);
