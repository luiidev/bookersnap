//angular.module('promotion.service', []);

angular.module('promotion.service', [])
.factory('PromotionFactory',function($http,ApiUrlReservation,ApiUrlGeneral){
  return {
    getLabel: function(vData){
      return $http.get(ApiUrlReservation+"/promotion/getlabel");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/labels"); 
    },
    getTypes: function(vData){
      return $http.get(ApiUrlReservation+"/promotion/gettypes");
      //return $http.get(ApiUrlGeneral+"/promotions/types"); 
    },
    getTypographys: function(vData){
      return $http.get(ApiUrlReservation+"/promotion/gettypographys");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/typographys"); 
    }
  };

})
.factory('TurnosPromotionFactory',function(){
  var turnoColection =[];
  var interfazTurnos = {
    nombre: "turnos",
    getTurnosItems: function(){
      return turnoColection;
    },
    setTurnosItems: function(turnoItem){
      turnoColection.push(turnoItem);
    },
    delTurnosItem: function(turnoItem){
      turnoColection.splice(turnoItem,1);
    },
    cleanTurnosItems: function(){
      turnoColection=[];
    },
  }
  return interfazTurnos;

});