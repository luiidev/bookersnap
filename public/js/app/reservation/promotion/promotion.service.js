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
      return $http.get(ApiUrlReservation+"/promotion/"+vId); 
    },
    editPromotion : function(vData){
      return $http.put(ApiUrlReservation + '/promotion/'+vData.id,vData); 
    },
    uploadtmpPromotion: function(file){
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
.factory('ZonesPromotionFactory',function(){
  var zoneColection =[];
  var interfazZones = {
    getZonesItems: function(){
      return zoneColection;
    },
    setZonesItems: function(zoneItem){
      zoneColection.push(zoneItem);
    },
    delZonesItem: function(zoneItem){
      angular.forEach(zoneColection, function(value,key) {
        if(value.table_id==zoneItem.table_id){
          zoneColection.splice(key,1);    
        }
      }); 
    },
    cleanZonesItems: function(){
      zoneColection=[];
    },
  }
  return interfazZones;

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
    getEvaluaInverse : function(valor){
      var evalua = "";
      switch(valor) {
        case true:
          evalua = 1;
        break;
        case false:
          evalua = 0;
        break;
      }
      return evalua;
    },
  }
});