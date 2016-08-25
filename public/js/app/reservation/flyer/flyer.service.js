angular.module('flyer.service', [])
.factory('FlyerFactory',function($http,ApiUrlReservation,$stateParams, UrlGeneral){

  return {
    getLabel: function(vData){
      return $http.get(UrlGeneral + "/promotions/flyers/labels");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/labels"); 
    },
    getTypographys: function(vData){
      return $http.get(UrlGeneral + "/promotions/flyers/typographys");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/typographys"); 
    },
    getFlyer: function(id_flyer){
      return $http.get(ApiUrlReservation + "/promotions/flyers/"+id_flyer);
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/typographys"); 
    },
    saveFlyer: function(vData){
      return $http.get(UrlGeneral + "/promotions/flyers/typographys");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/typographys"); 
    }
  };

})