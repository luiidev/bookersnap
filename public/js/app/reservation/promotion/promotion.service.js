angular.module('promotion.service', [])
.factory('PromotionDataFactory',function($http,AppBookersnap){
  return {
    getTypes: function(){
      return $http.get(AppBookersnap+"/promotion/gettypes");
      //return $http.get(ApiUrlGeneral+"/promotions/types"); 
    },

    createPromotion : function(pData){
      return $http.post(AppBookersnap + '/promotion',pData); 
    },
    getPromotion : function(pId){
      return $http.get(AppBookersnap+"/promotion/"+pId); 
    },
    editPromotion : function(pData){
      return $http.put(AppBookersnap + '/promotion/'+pData.id,pData); 
    },
    uploadtmpPromotion: function(file){
    },
  };


})

.factory('ZonasDataFactory',function($http,ApiUrlMesas){
  return {
    getZones: function(){
      return $http.get(ApiUrlMesas+"/zones");
    },
  }
})

.factory('PromotionFactory',function(ZonasDataFactory,TableFactory,$q){
  return {
    listZones: function(){
      var defered=$q.defer();
      ZonasDataFactory.getZones().success(function(data){
          var vZones = [];
          angular.forEach(data.data, function(zones) {
            var tables = zones.tables;
            var vTables = [];
            angular.forEach(tables, function(table) {
              var position = table.config_position.split(",");
              var dataTable = {
                zone_id : zones.id,
                name_zona : zones.name,
                table_id: table.id,
                name : table.name,
                minCover : table.min_cover,
                maxCover : table.max_cover,
                left : position[0],
                top : position[1],
                shape : TableFactory.getLabelShape(table.config_forme),
                size : TableFactory.getLabelSize(table.config_size),
                rotate : table.config_rotation,
                price : table.price,
              }
              vTables.push(dataTable); 
            });
            var dataZone = {
              zone_id : zones.zone_id,
              name :  zones.name,
              table : vTables,
            }
            vZones.push(dataZone);
          });
  
        defered.resolve(vZones);
      }).error(function(data, status, headers){
        defered.reject(data);
      });
      return defered.promise;
    },
  }
})

.factory('TurnosPromotionDataFactory',function(){
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
.factory('ZonesPromotionDataFactory',function(){
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