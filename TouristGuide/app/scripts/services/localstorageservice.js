angular.module('starter.services')

  .factory('Storage', function() {

    function changeRestaurantFavorites(favorites) {
      window.localStorage.setItem('restFavorites', JSON.stringify(favorites));
    }

    function changePhotoFavorites(favorites) {
      window.localStorage.setItem('photFavorites', JSON.stringify(favorites));
    }

    function getRestaurantFavorites() {
      return window.localStorage.getItem('restFavorites');
    }

    function getPhotoFavorites() {
      return window.localStorage.getItem('photFavorites');
    }

    return {
      addRestaurantToFavorites: function(favorites) {
        changeRestaurantFavorites(favorites)
      },
      removeRestaurantFromFavorites: function(favorites) {
        changeRestaurantFavorites(favorites)
      },
      addPhotoToFavorites: function(favorites) {
        changePhotoFavorites(favorites)
      },
      removePhotoFromFavorites: function(favorites) {
        changePhotoFavorites(favorites)
      },
      getAllRestaurantFavorites: function() {
        return getRestaurantFavorites();
      },
      getAllPhotoFavorites: function() {
        return getPhotoFavorites();
      }
    }

  });
