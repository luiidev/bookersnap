angular.module('block.service', [])
.factory('BlockFactory',function($http,ApiUrlMesas){
	return {
		getAllBlock: function(vDate){
				return $http.get(ApiUrlMesas+"/blocks/tables?"+vDate); 
		},
		getBlock: function(vDate){
				return $http.get(ApiUrlMesas+"/blocks/"+vDate); 
		},
		addNewBlock: function(data){

				return $http({url:ApiUrlMesas+"/blocks", method: "POST", data: data}).then(function successCallback(response) {
						    return response;
						  }, function errorCallback(response) {
						  	return response;
						  })

		},
		deleteBlock: function(id_block){
				return $http({url:ApiUrlMesas+"/blocks/"+id_block, method: "DELETE"}).then(function successCallback(response) {
						    return response;
						  }, function errorCallback(response) {
						  	return response;
						  })

		},
		editBlock: function(variablesUrl, data){
				return $http({url: ApiUrlMesas + "/blocks" + variablesUrl, method: "PUT", data: data}); 
		},
		coverList: function (){
			return {
	            dataMin : [],
	            selectedMin : '',
	            dataMax : [],
	            selectedMax : ''
        	};
		},
		boxTables: function (){
			return {
	            items : true,
	            item : false
        	};
		},
		updateTablesBlocked: function(scope, sce){
			 /* Mensaje */
            var res = scope.mesasBloqueadas.toString().replace(/,/g,", "); 
            scope.someSafeContent = sce.trustAsHtml("<b>" + res + "</b>");
		},
		checkTable: function(scope, sce, index, data){

            /************************************************************************************* 
            Se crea crea el metodo para poder identificar cual es la clase que esta seleccionada  
            **************************************************************************************/
                //Se carga la clase a la mesa para poder mostrar en el sistema
                var zoneSelect = scope.zone;
                angular.forEach(scope.zones, function(value, key) {

                  if(value.id == zoneSelect.id){
                    scope.zones[key].tables[index].class = "selected-table"; // Se carga una clase cuando se selecciona la mesa
                  }

                });
            /*************************************************************************************/
                scope.mesasBloqueadas.push(data.id);
                this.updateTablesBlocked(scope, sce); // Actualizar mensaje

		},uncheckTable: function(scope,sce, index, data){

            /************************************************************************************* 
            Se crea crea el metodo para poder identificar cual es la clase que esta seleccionada  
            **************************************************************************************/
                //Se carga la clase a la mesa para poder mostrar en el sistema
                var zoneSelect = scope.zone;
                angular.forEach(scope.zones, function(value, key) {

                  if(value.id == zoneSelect.id){
                    scope.zones[key].tables[index].class = ""; // Se carga una clase cuando se selecciona la mesa
                  }

                });
            /*************************************************************************************/
            
            var item = scope.mesasBloqueadas.indexOf(data.id);
            
            if(item > -1){
                data.class = "";
                scope.mesasBloqueadas.splice(item, 1);
            }

            this.updateTablesBlocked(scope, sce); // Actualizar mensaje
		},
		selectAllTables: function (scope,sce, loadTablesEdit){
			 
			 angular.forEach(scope.zones, function(zona, key) {
                    angular.forEach(zona.tables, function(mesa, i) {
                        scope.zones[key].tables[i].class = "selected-table";

                         // Se agrega la mesa bloqueada en el array de mesasBloqueadas
                         if(scope.mesasBloqueadas.indexOf(scope.zones[key].tables[i].id) == -1 ){
                             scope.mesasBloqueadas.push(scope.zones[key].tables[i].id);   
                         }
                    });    
            });

            this.updateTablesBlocked(scope, sce); // Actualizar mensaje
            
            var posicion = scope.zones.indexOf(scope.zone);
            if(posicion != -1){
                var item = scope.zones[posicion];
                angular.forEach(scope.zones, function(value, key){
                    if(value.id == item.id){
                        scope.itemTables = []; // Variable donde se cargan las mesas a mostrar
                        loadTablesEdit(value.tables);
                    }
                });
            }

		},
		unselectAllTables: function (scope,sce, loadTablesEdit){

			angular.forEach(scope.zones, function(zona, key) {
                    angular.forEach(zona.tables, function(mesa, i) {
                        scope.zones[key].tables[i].class = "";
                        scope.mesasBloqueadas = []; // Se remuven todas las mesas bloqueadas  
                    });    
            });

            this.updateTablesBlocked(scope, sce); // Actualizar mensaje
            
            var posicion = scope.zones.indexOf(scope.zone);
            if(posicion != -1){
                var item = scope.zones[posicion];
                angular.forEach(scope.zones, function(value, key){
                    if(value.id == item.id){
                        scope.itemTables = []; // Variable donde se cargan las mesas a mostrar
                        loadTablesEdit(value.tables);
                    }
                });
            }

		},
		initItemTables: function (scope, tables, TableFactory){

			angular.forEach(tables,function(data){

                var position = data.config_position.split(",");
                var dataTable = {
                    name : data.name,
                    class : data.class,
                    classBloqueado : data.classBloqueado,
                    minCover : data.min_cover,
                    maxCover : data.max_cover,
                    left : position[0],
                    top : position[1],
                    shape : TableFactory.getLabelShape(data.config_forme),
                    size : TableFactory.getLabelSize(data.config_size),
                    rotate : data.config_rotation,
                    id : data.id,
                    status : data.status
                }

                if(data.status == 1){
                    scope.itemTables.push(dataTable);
                }else{
                    scope.itemTablesDeleted.push(dataTable);
                }

            });

		}	

	};

});