angular.module('flyer.service', [])
.factory('FlyerFactory',function($http,AppBookersnap){
  return {
    getLabel: function(vData){
      return $http.get(AppBookersnap+"/promotion/getlabel");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/labels"); 
    },
    getTypographys: function(vData){
      return $http.get(AppBookersnap+"/promotion/gettypographys");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/typographys"); 
    }
  };

})