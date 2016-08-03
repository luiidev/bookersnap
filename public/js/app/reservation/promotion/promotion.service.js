//angular.module('promotion.service', []);

angular.module('promotion.service', [])
.factory('PromotionFactory',function($http,ApiUrlReservation){
  return {
    getLabel: function(vData){
      return $http.get(ApiUrlReservation+"/promotion/getlabel"); 
    }
  };

});