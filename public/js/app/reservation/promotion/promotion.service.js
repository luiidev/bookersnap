//angular.module('promotion.service', []);

angular.module('promotion.service', [])
.factory('PromotionFactory',function($http,ApiUrlReservation){
  return {
    getTurn: function(vData){
      return $http.get(ApiUrlReservation+"/turn"); 
    }
  };

});