angular.module('promotion.service', [])
.factory('PromotionFactory',function($http,ApiUrlReservation,ApiUrlGeneral){
  return {
    getTypes: function(vData){
      return $http.get(ApiUrlReservation+"/promotion/gettypes");
      //return $http.get(ApiUrlGeneral+"/promotions/types"); 
    },
    getZones: function(vData){
      return $http.get(ApiUrlReservation+"/promotion/getzones");
      //return $http.get(ApiUrlGeneral+"/promotions/types"); 
    },
    createPromotion : function(vData){
      return $http.post(ApiUrlReservation + '/promotion',vData); 
    },
    getPromotion : function(vId){
      return $http.get(ApiUrlReservation+"/promotion/"+vId+"/getpromotion"); 
    },
    editPromotion : function(vData){
      return $http.put(ApiUrlReservation + '/promotion/'+vData.id,vData); 
    },
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

})
.factory('TableFactory',function(){
  return {
    getLabelShape : function(id){
      var label = "";
      switch(id) {
        case 1:
          label = "round";
        break;
        case 2:
          label = "square";
        break;
        case 3:
          label = "recta";
        break;
      }
      return label;
    },
    getLabelSize : function(id){
      var label = "";
      switch(id) {
        case 1:
          label = "small";
        break;
        case 2:
          label = "medium";
        break;
        case 3:
          label = "large";
        break;
      }
      return label;
    },
    getEvalua : function(valor){
      var evalua = "";
      switch(valor) {
        case 1:
          evalua = true;
        break;
        case 0:
          evalua = false;
        break;
      }
      return evalua;
    },
  }
});