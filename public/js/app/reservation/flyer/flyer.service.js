angular.module('flyer.service', [])
.factory('FlyerFactory',function($http,ApiUrlReservation,ApiUrlGeneral,$stateParams){

  return {
    getLabel: function(vData){
      return $http.get(ApiUrlGeneral + "promotions/flyers/labels");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/labels"); 
    },
    getTypographys: function(vData){
      return $http.get(ApiUrlGeneral + "promotions/flyers/typographys");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/typographys"); 
    },
    getFlyer: function(id_flyer, microsite_id){
      return $http.get(ApiUrlGeneral + "microsites/"+ microsite_id +"/promotions/flyers/"+id_flyer);
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/typographys"); 
    },
    saveFlyer: function(vData){
      return $http.get(ApiUrlGeneral + "promotions/flyers/typographys");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/typographys"); 
    }
  };

})