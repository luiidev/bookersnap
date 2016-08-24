angular.module('flyer.service', [])
.factory('FlyerFactory',function($http,ApiUrlReservation,ApiUrlGeneral){
  return {
    getLabel: function(vData){
      return $http.get(ApiUrlReservation+"/promotion/getlabel");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/labels"); 
    },
    getTypographys: function(vData){
      return $http.get(ApiUrlReservation+"/promotion/gettypographys");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/typographys"); 
    }
  };

})