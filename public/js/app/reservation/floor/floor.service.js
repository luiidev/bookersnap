angular.module('floor.service', [])
.factory('FloorDataFactory',function($http,AppBookersnap,ApiUrlReservation){
	return {

	}
})

.factory('FloorFactory',function($q,ZoneFactory,TableFactory){
	return {
    	listZones: function(){
	      var defered=$q.defer();
	      ZoneFactory.getZones().success(function(data){
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
