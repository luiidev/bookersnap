angular.module('zone.service', [])
.factory('ZoneFactory',function($http,ApiUrl){
  return {
    getZones: function(vData){
      return $http.get(ApiUrl+"/zone"); 
    }
  };

});