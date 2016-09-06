angular.module('promotion.service', [])
.factory('PromotionDataFactory',function($http,AppBookersnap,ApiUrlReservation){
  return {
    createPromotion : function(pData){
      return $http.post(AppBookersnap + '/promotion',pData); 
    },
    getPromotion : function(pId){
      return $http.get(AppBookersnap+"/promotion/"+pId); 
    },
    getHorario : function(){
      return $http.get(ApiUrlReservation+"/shifts"); 
    },
    updatePromotion : function(pData){
      return $http.put(AppBookersnap + '/promotion/'+pData.event_id,pData); 
    },
    uploadtmpPromotion: function(file){
    },
    getTablesPayment: function(pId){
      return $http.get(ApiUrlReservation+"/promotions/"+pId+"/table/payments");
    },
    deleteTablesPayment: function(pId,tpId){
      return $http.delete(ApiUrlReservation+"/promotions/"+pId+"/table/payments/"+tpId);
    },
    createTablesPayment: function(pData){
      return $http.post(ApiUrlReservation+"/promotions/"+pData.event_id+"/table/payments",pData);
    }
  };
})

.factory('ZonasDataFactory',function($http,ApiUrlMesas){
  return {
    getZones: function(){
      return $http.get(ApiUrlMesas+"/zones");
    }
  }
})

.factory('TiposDataFactory',function($http,UrlGeneral){
  return {
    getTypes: function(){
      return $http.get(UrlGeneral+"/promotions/types");
    }
  }
})

.factory('PromotionFactory',function(ZonasDataFactory,TiposDataFactory,TableFactory,PromotionDataFactory,$q,TurnosPromotionDataFactory,ZonesActiveFactory,UrlRepository,$filter){
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
    listSchedules: function(){
      var defered=$q.defer();
      PromotionDataFactory.getHorario().success(function(data){
        var schedules = data.data;
        var vSchedules=TurnosPromotionDataFactory.generatedTimeTable(schedules);
        defered.resolve(vSchedules);     
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
          myImage:UrlRepository+'/promotions/'+promotion.image,
          imagenOriginal:promotion.image,
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
    listTablesPayment: function(pId){
      var defered=$q.defer();
      PromotionDataFactory.getTablesPayment(pId).success(function(data){
        defered.resolve(data.data);
      }).error(function(data, status, headers){
        defered.reject(data.data);
      });     
      return defered.promise;
    },
    listZonesEdit:function(pId){
      var me=this;
      var defered=$q.defer();
      me.listZones().then(
        function success(data){
          return data;
        },
        function error(data){
          return data;
        }

      ).then(function(zones){
        me.listTablesPayment(pId).then(
          function success(tables){
             var vTables=[];
             angular.forEach(tables, function(tableData) {
              angular.forEach(tableData, function(table) {
                vTables.push(table);
              });
             });
           return vTables;
          },
          function error(response){
            //console.log('Aqui graficar zonas');
            return response;
          }
        ).then(
          function success(tablesPay){
           var vZonas=[];
           
            angular.forEach(zones, function(zone) {
              var vTable={
                zone_id : zone.zone_id,
                name:zone.name,
                table:[]
              }
              angular.forEach(zone.table, function(table) {

                if(tablesPay){
                  angular.forEach(tablesPay, function(tableData) {                    
                      if(tableData.table_id==table.table_id && tableData.price!=''){
                        ZonesActiveFactory.setZonesItems(table);
                        table.price=tableData.price;
                      }
                  });
                }
                
                vTable.table.push(table);
              }); 
              vZonas.push(vTable);          
            });
     
            defered.resolve(vZonas);
          },
          function error(response){
            //console.log('deverias03');
            defered.reject(response);
          }
        );
        
      });

      return defered.promise;
    }
  }
})

.factory('TurnosPromotionDataFactory',function($http,TableFactory,$filter,ApiUrlReservation){
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
    createTurnPromotion : function(pId,tData){
      return $http.post(ApiUrlReservation + '/promotions/'+pId+'/shifts',tData); 
    },
    deleteTurnPromotion: function(pId,tId){
      return $http.delete(ApiUrlReservation+"/promotions/"+pId+"/shifts/"+tId);
    },
    generatedTimeTable : function(turnData){
      var times = TableFactory.rangeDateAvailable(60,turnData);
      var timesFinal = [];

      angular.forEach(times, function(value, key){

        var hourIndex = value.indexOf(":");
        var min = value.substr(hourIndex);

        hourIndex = value.substr(0,hourIndex);
        
        
        //min = min.replace(":","");
        //min = min.replace("AM","");
        //min = min.replace("PM","");

        var index = hourIndex * 4;

        if(min == 15){
          index +=1;
        }else if(min == 30){
          index +=2;
        }else if(min == 45){
          index +=3;
        }

        var d = new Date(0,0,0,hourIndex,0,0);
        var formato = moment(d).valueOf();
        var hora = $filter('date')(formato,'h:mm a');

        timesFinal.push({
          time : hora,
          time_ori:value,
          index : index
        });
  
      });
      return timesFinal;
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
.factory('TableFactory',function($filter){
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
    rangeDateAvailable: function(minSteep,turn){

      var iniHour = turn.hours_ini_min.substr(0,2);
      var iniMin = turn.hours_ini_min.substr(3,2);

      var endHour = parseInt(turn.hours_end_max.substr(0,2));
      var endMin = parseInt(turn.hours_end_max.substr(3,2));

      var hour = parseInt(iniHour);
      var min = parseInt(iniMin);

      var time = [];
  
      if(hour <= endHour){
        while(hour <= endHour){

          //var sHorario = (hour <=11) ? "AM":"PM";
          //var hora = hour +":"+ ((min == 0) ? "00" : min) + " " + sHorario
          var hora = hour +":"+ ((min == 0) ? "00" : min) + ":00";
          time.push(hora);
          
          if(min == (60 - minSteep) ){
            hour += 1;
            min = 0;
          }else{
            if(hour == endHour && min == endMin){
              hour = 45;
            }
            min += minSteep;  
          }
            
        }
      }else if(endHour < hour){

          if(hour<=11){
            var num01=24-hour;
            for (a = 0; a < num01; a++) {

              var hora = hour +":"+ ((min == 0) ? "00" : min);
              time.push(hora);

              if(min == (60 - minSteep) ){
                hour += 1;
                min = 0;
              }
            }

          }else{
            var num01=24-hour;
             for (i = 0; i < num01; i++) {
              var hora = hour +":"+ ((min == 0) ? "00" : min);
              time.push(hora);

              if(min == (60 - minSteep) ){
                hour += 1;
                min = 0;
              }
            }
          }

          if(endHour>11){
            //var num02=24-endHour;
          }else{
            var num02=endHour-0;
            for (h = 0; h <= num02; h++) {

              var hora = h +":"+ ((min == 0) ? "00" : min);
              time.push(hora);

              if(min == (60 - minSteep) ){
                endHour += 1;
                min = 0;
              }
            }
          }

      }
      return time;
    },
  }
});