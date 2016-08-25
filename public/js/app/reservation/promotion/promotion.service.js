angular.module('promotion.service', [])
.factory('PromotionDataFactory',function($http,AppBookersnap){
  return {
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

.factory('ZonasDataFactory',function($http,ApiUrlMesas,ApiUrlReservation){
  return {
    getZones: function(){
      return $http.get(ApiUrlMesas+"/zones");
    },
    getZone: function(pId){
      return $http.get(ApiUrlReservation+"/promotions/"+pId+"/table/payments");
    },
  }
})

.factory('TiposDataFactory',function($http,UrlGeneral){
  return {
    getTypes: function(){
      return $http.get(UrlGeneral+"/promotions/types");
    }
  }
})

.factory('PromotionFactory',function(ZonasDataFactory,TiposDataFactory,TableFactory,PromotionDataFactory,$q,TurnosPromotionDataFactory,ZonesActiveFactory){
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
    listTypes: function(){
      var defered=$q.defer();
      TiposDataFactory.getTypes().success(function(data){
        var vTypes = [];
        angular.forEach(data.data, function(types) {
          vTypes.push(types); 
        });
        defered.resolve(vTypes);     
      }).error(function(data, status, headers){
        defered.reject(data);
      });     
      return defered.promise;
    },
    onlyPromotion: function(pId){
      var defered=$q.defer();
      PromotionDataFactory.getPromotion(pId).success(function(data){
        var promotion=data.data;
        var vPromotion = [];
        var dataPromotion = {
          title:promotion.title,
          description:promotion.description,
          status_expire:TableFactory.getEvalua(promotion.status_expire),
          date_expire:promotion.date_expire,
          publication:TableFactory.getEvalua(promotion.publication),
          tipoSelected:{type_event_id : promotion.type_event},
          status:[{name:'Vigente',value:1},{name:'Deshabilitado',value:2}],
          statusSelected:{value : promotion.status},
          myImage:'',
          turn: promotion.turn,
          //zonas: promotion.zone
        }
        vPromotion.push(dataPromotion);

        var turnos=promotion.turn
        angular.forEach(turnos, function(turn) {
          TurnosPromotionDataFactory.setTurnosItems(turn);
        });

        defered.resolve(vPromotion[0]);     
      }).error(function(data, status, headers){
        defered.reject(data);
      });     
      return defered.promise;
    },
    onlyZone: function(pId){
      var defered=$q.defer();
      ZonasDataFactory.getZone(pId).success(function(data){
        
        var vZones = [];
        angular.forEach(data.data, function(zones) {
            var tables = zones.table;
            angular.forEach(tables, function(table) {
              var position = table.config_position.split(",");
              if(table.price!=''){
                var dataTable = {
                  zone_id : zones.zone_id,
                  name_zona : zones.name,
                  table_id: table.table_id,
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
                ZonesActiveFactory.setZonesItems(dataTable);
                vZones.push(dataTable);
              }
            });
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
.factory('ZonesActiveFactory',function(){
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