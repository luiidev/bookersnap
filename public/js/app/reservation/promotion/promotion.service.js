//angular.module('promotion.service', []);

angular.module('promotion.service', [])
.factory('PromotionFactory',function($http,ApiUrlReservation){
  return {
    getTurn: function(vData){
      return $http.get(ApiUrlReservation+"/turn"); 
      //return $http.get("http://web.aplication.bookersnap/v1/es/admin/ms/12/mesas/turn");
    }
  };

});