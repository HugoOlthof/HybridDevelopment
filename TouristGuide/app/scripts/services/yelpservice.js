angular.module('starter.services')

  .factory('Yelp', function($http, $ionicLoading, Storage, YelpSearchUrl, YelpGetMethod, ConsumerSecret, TokenSecret) {

    var restaurants = [];
    var favorites = [];

    // Helper function to create a random string, needed for a Yelp request
    function randomString(length, chars) {
      var result = '';
      for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
    }

    // A remove function
    Array.prototype.remove = function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
    };

    // Synchronize the unfavorited photo with the photo's list
    // When a photo is unfavorited, the original photo list needs to be informed
    // to change its values
    function syncUnFavorites(theRestaurant) {
      var restTemp = JSON.parse(restaurants);

      for (var i = 0; i < restTemp.length; i++) {
        if(restTemp[i].id === theRestaurant) {
          restTemp[i].favorite = false;
        }
      }
      restaurants = JSON.stringify(restTemp);
    }

    // Synchronize the favorited photo with the photo's list
    // When a photo is favorited, the original photo list needs to be informed
    // to change its values
    function syncFavorites() {
      var restTemp = JSON.parse(restaurants);
      var favTemp = JSON.parse(favorites);

      for (var i = 0; i < favTemp.length; i++) {
        for (var j = 0; j < restTemp.length; j++) {
          if (favTemp[i].id === restTemp[j].id) {
            restTemp[j].favorite = true;
          }
        }
      }
      restaurants = JSON.stringify(restTemp);
      favorites = JSON.stringify(favTemp);
    }

    // Parses the retrieved JSON into a restaurant object and pushes it to the restaurant list
    function parser(data, region) {
      for (var i = 0; i < data.length; i++) {
        var rest =
        {
          name: data[i].name,
          id: data[i].id,
          city: data[i].location.city,
          image: data[i].image_url,
          address: data[i].location.address[0],
          phone: data[i].display_phone,
          category: data[i].categories[0][0],
          ratingImage: data[i].rating_img_url,
          rating: data[i].rating,
          distance: data[i].distance,
          favorite: false,
          latitude: region.center.latitude,
          longitude: region.center.longitude
        };

        restaurants.push(rest);
      }
    }

    return {
      "getAllRestaurants": function (latitude, longitude) {
        var params = {
          callback: 'angular.callbacks._0',
          ll: latitude + ',' + longitude,
          oauth_consumer_key: 'ILO5uDJZDbjwfbv-y2WqhA',
          oauth_token: 'krKgxlI3EMfABDc-bGcNmshqWS1k_sWF',
          oauth_signature_method: "HMAC-SHA1",
          oauth_timestamp: new Date().getTime(),
          oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
          term: 'restaurant'
        };

        // Generate a oauth signature
        var signature = oauthSignature.generate(YelpGetMethod, YelpSearchUrl, params, ConsumerSecret, TokenSecret, {encodeSignature: false});
        params['oauth_signature'] = signature;

        // Call to retrieve restaurants from user's current location
        $http.jsonp(YelpSearchUrl, {params: params}).success(function(data) {
          // Parse the returned JSON
          parser(data.businesses, data.region);

          // Apply changes for the existing restaurants list
          restaurants = JSON.stringify(restaurants);

          // Get all favorites from localstorage (if any)
          var fromStorage = Storage.getAllRestaurantFavorites();
          if(fromStorage) {
            favorites = fromStorage;
          }
          else {
            favorites = JSON.stringify(favorites);
          }

          // Synchronize favorites list with restaurant list
          syncFavorites();
        });
      },
      onRestaurantsChange: function () {
        return restaurants;
      },
      onFavoritesChange: function () {
        return favorites;
      },
      getAllFavorites: function () {
        var fromStorage = Storage.getAllRestaurantFavorites();
        if(fromStorage) {
          favorites = fromStorage;
        }
      },
      getRestaurant: function (restaurantId) {
        var temp = JSON.parse(restaurants);

        // Search for the restaurant object which matches to the restaurant ID
        // and return that object
        for (var i = 0; i < temp.length; i++) {
          if (temp[i].id === restaurantId) {
            return temp[i];
          }
        }
        return null;
      },
      favorite: function (restaurantId, isFavorite) {
        // If isFavorite is false (user wants to unfavorite a restaurant)
        if(!isFavorite) {
          var favTemp = JSON.parse(favorites);

          // Get restaurants favorites from localstorage
          var fromStorage = Storage.getAllRestaurantFavorites();

          fromStorage = JSON.parse(fromStorage);

          // Get the index of the objects from the lists so we can remove the objects
          var indexOfRestaurantInStorage = fromStorage.map(function(el) { return el.id; }).indexOf(restaurantId);
          var indexOfRestaurantInFavorites = favTemp.map(function(el) { return el.id; }).indexOf(restaurantId);

          // Remove restaurant from the localstorage list and the favorites list
          fromStorage.remove(indexOfRestaurantInStorage);
          favTemp.remove(indexOfRestaurantInFavorites);

          // Remove restaurant from localstorage
          Storage.removeRestaurantFromFavorites(fromStorage);

          // Apply changes for the existing favorites list
          favorites = JSON.stringify(favTemp);

          // Synchronize favorites list with restaurant list
          syncUnFavorites(restaurantId);
        }
        // If isFavorite is true (user wants to favorite a restaurant)
        else {
          var restTemp = JSON.parse(restaurants);
          var favTemp = JSON.parse(favorites);

          // Search for the restaurant object which matches to the restaurant ID
          for (var i = 0; i < restTemp.length; i++) {
            if (restTemp[i].id === restaurantId) {
              restTemp[i].favorite = isFavorite;

              // Get restaurants favorites from localstorage
              var fromStorage = Storage.getAllRestaurantFavorites();

              // If there is something in localstorage
              if (fromStorage) {
                fromStorage = JSON.parse(fromStorage);

                // Add restaurant to the localstorage list and the favorites list
                fromStorage.push(restTemp[i]);
                favTemp.push(restTemp[i]);

                // Save restaurant to localstorage
                Storage.addRestaurantToFavorites(fromStorage);

                // Apply changes for the existing favorites list
                favorites = JSON.stringify(favTemp);

                // Synchronize favorites list with restaurant list
                syncFavorites();
              }
              // If localstorage is empty
              else {
                favTemp.push(restTemp[i]);

                // Save restaurant to localstorage
                Storage.addRestaurantToFavorites(favTemp);

                // Apply changes for the existing favorites list
                favorites = JSON.stringify(favTemp);

                // Synchronize favorites list with restaurant list
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
