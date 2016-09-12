angular.module('block.controller', [])
.controller('blockCtr', function($scope,$http, $state, $sce,$stateParams,$document, ApiUrlMesas,BlockFactory, ZoneFactory,ZoneLienzoFactory,TableFactory,$uibModal,IdMicroSitio) {

        $scope.fecha = $stateParams.fecha;

         /* Listado array de zonas incluyendo sus zonas */
        ZoneFactory.getZones().then(function(response){
            $scope.zones = response.data.data; // Lista de Zonas que contienen mesas
            return $scope.zones;
        }).then(function(zonas){
                
              // Se obtiene de array de las mesas que estan en ese rango de fecha
              BlockFactory.getAllBlock("fecha="+$scope.fecha).then(function(response){
                var mesasFuturasBloqueadas = response.data.data;

                /////////////////////////////////////////////////////////////////////////////////////// 
                //Se agrega la clase para identificar los bloqueos futuros dentro del array principal  
                ///////////////////////////////////////////////////////////////////////////////////////
                angular.forEach(zonas, function(zona, key) {
                    angular.forEach(zona.tables, function(mesa, i) {
                            // Iteracion para identificar las mesas bloqueadas 
                            for(var p=0; p < mesasFuturasBloqueadas.length; p++){
                                if(mesa.id == mesasFuturasBloqueadas[p].res_table_id){
                                    $scope.zones[key].tables[i].classBloqueado = "selected-table-2";
                                }
                            }
                    // Iteracion para mostrar mesas bloqueadas en el mismo rango de fechas bloqueadas 
                    });    
                });
                //////////////////////////////////////////////////////////////////////////////////////
              }); 

        }).then(function(){

        
        });  

        /** Pantalla Crear Block **/
        $scope.shifts = [];
        $scope.startTimes = [];
        $scope.endTimes = [];
        $http.get(ApiUrlMesas + '/calendar/' + $stateParams.fecha+'/shifts').success(function(response) {
            angular.forEach(response.data, function(item, i) {
                if(item.turn != null){ // Se obtienes los Shifts que contienen datos

                    $scope.shifts.push({
                        id: item.id,
                        name: item.name,
                        startTimes: getRangoHours(item.turn.hours_ini, item.turn.hours_end),
                        endTimes: getRangoHours(addHourByMin(item.turn.hours_ini), item.turn.hours_end),
                     });

                    // Se muestra el primer array para cuando se esta creando el bloqueo
                    $scope.shift = $scope.shifts[0];
                    $scope.startTimes = $scope.shifts[0].startTimes;
                    $scope.endTimes = $scope.shifts[0].endTimes;
                }
            });
        });    
        

         // Se muestran las mesas de la zona seleccionada   
         $scope.selectZone = function(item){
            angular.forEach($scope.zones, function(value, key){
                if(value.id == item.id){
                    $scope.itemTables = []; // Variable donde se cargan las mesas a mostrar
                    loadTablesEdit(value.tables);
                }
            });
         };

           // Se cambia el rango del shift elegido de acuerdo a la eleccion   
        $scope.changueRange = function(item){
            $scope.startTimes = item.startTimes;
            $scope.endTimes = item.endTimes;
         };

        $scope.coversList = {
            dataMin : [],
            selectedMin : '',
            dataMax : [],
            selectedMax : ''
        }

        $scope.boxTables = {
            items : true,
            item : false
        }


        var listCovers = function(option){

            var coverList = "";

            if (option == "min") {
                coverList = $scope.coversList.dataMin;
            }else{
                coverList = $scope.coversList.dataMax;
            }

            for (var i = 1; i <=30; i++) {
                var data = {
                    label : i+" covers",
                    id : i
                }

                coverList.push(data);
            }

            if (option == "min") {
                $scope.coversList.selectedMin = coverList[0];
            }else{
                $scope.coversList.selectedMax = coverList[0];
            }
        };

        
          /***************Funcion ejecutada por directiva****************/
          $scope.mesasBloqueadas = [];
          $scope.activarTableOptions = function(index,data){
                
            /************************************************************************************* 
            Se crea crea el metodo para poder identificar cual es la clase que esta seleccionada  
            **************************************************************************************/
                //Se carga la clase a la mesa para poder mostrar en el sistema
                var zoneSelect = $scope.zone;
                angular.forEach($scope.zones, function(value, key) {

                  if(value.id == zoneSelect.id){
                    $scope.zones[key].tables[index].class = "selected-table"; // Se carga una clase cuando se selecciona la mesa
                  }

                });
            /*************************************************************************************/

                $scope.mesasBloqueadas.push(data.id);

            /* Mensaje */
            var res = $scope.mesasBloqueadas.toString().replace(/,/g,", "); 
            $scope.someSafeContent = $sce.trustAsHtml("<b>" + res + "</b>");

          };
          
          $scope.desactivarTable = function (index,data) {


            /************************************************************************************* 
            Se crea crea el metodo para poder identificar cual es la clase que esta seleccionada  
            **************************************************************************************/
                //Se carga la clase a la mesa para poder mostrar en el sistema
                var zoneSelect = $scope.zone;
                angular.forEach($scope.zones, function(value, key) {

                  if(value.id == zoneSelect.id){
                    $scope.zones[key].tables[index].class = ""; // Se carga una clase cuando se selecciona la mesa
                  }

                });
            /*************************************************************************************/


            var item = $scope.mesasBloqueadas.indexOf(data.id);
            if(item > -1){
                data.class = "";
                $scope.mesasBloqueadas.splice(item, 1);
            }

            /* Mensaje */
            var res = $scope.mesasBloqueadas.toString().replace(/,/g,", "); 
            $scope.someSafeContent = $sce.trustAsHtml("<b>" + res + "</b>");

          }

        var getDataTableSelected = function(index){

            $scope.indexTable = index;

            angular.element("#name-table").val($scope.itemTables[index].name);
            $scope.changeShapeTable($scope.itemTables[index].shape);

            $scope.itemTables[index].top = angular.element("#tb-item"+index).css("top").replace("px","");
            $scope.itemTables[index].left = angular.element("#tb-item"+index).css("left").replace("px","");

            $scope.coversList.selectedMin = {
                id :$scope.itemTables[$scope.indexTable].minCover,
                label : $scope.itemTables[$scope.indexTable].minCover +" covers"
            };

            $scope.coversList.selectedMax = {
                id :$scope.itemTables[$scope.indexTable].maxCover,
                label : $scope.itemTables[$scope.indexTable].maxCover +" covers"
            };

            $scope.sizeTableList.selectedOption = {
                id : TableFactory.getIdSize($scope.itemTables[index].size),
                label : $scope.itemTables[index].size
            };
        };

        $scope.openCalendar = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.object = [];
        $scope.saveZone = function(option){
            

            if($scope.startTime == undefined || $scope.endTime == undefined || $scope.fecha == undefined ){
                
                messageAlert("Warning", "Tienes que seleccionar \"Start Time\", \"End Time\" y \"fecha\" ","warning",3000);

            }else{

                //Se arma la estrutura de datos
                $scope.object= {
                            start_date: $scope.fecha,
                            start_time: $scope.startTime.hour24,
                            end_time: $scope.endTime.hour24,
                            tables: [],
                            }       

                //Se crea el array de mesas bloqueadas          
                for(var i=0; i<$scope.mesasBloqueadas.length; i++){
                    $scope.object.tables.push({id:$scope.mesasBloqueadas[i]});
                }
                
                BlockFactory.addNewBlock($scope.object).then(function(response){
                    if(response.data.success === true){ 
                        messageAlert("Success", response.data.msg,"success",3000);
                    } else if(response.data.response == false){
                        messageAlert("Warning", response.data.jsonError,"warning",2000);
                    }
                });  


                }

        };
       
        /* Esta clase recorre las mesas listadas y crea un nuevo objeto dataTable que se iterara en la vista para imprimir las mesas * */
        var loadTablesEdit = function(tables){
            
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
                    $scope.itemTables.push(dataTable);
                }else{
                    $scope.itemTablesDeleted.push(dataTable);
                }

            });

        };

        listCovers("min");
        listCovers("max");
    })

.controller('blockCtrEdit', function($scope,$http, $sce, $state,$stateParams,$document, ApiUrlMesas,BlockFactory, ZoneFactory,ZoneLienzoFactory,TableFactory,$uibModal,IdMicroSitio) {

        $scope.fecha = $stateParams.fecha;
        var block_id = $stateParams.block_id;
        
        // Se trae la informacion del bloqueo para poder mostrar las tablas y editar
        BlockFactory.getBlock(block_id).then(function(response){

            $scope.startTime =  convertFechaYYMMDD(response.data.data.start_time);
            angular.forEach(response.data.data.tables, function(mesa, indexMesa) {
                    $scope.mesasBloqueadas.push(mesa.id);    
            });

            /* Mensaje */
            var res = $scope.mesasBloqueadas.toString().replace(/,/g,", "); 
            $scope.someSafeContent = $sce.trustAsHtml("<b>" + res + "</b>");
  
            return $scope.mesasBloqueadas;
    
        }).then(function (mesasBloqueadas){

                // Listado array de zonas incluyendo sus zonas 
                ZoneFactory.getZones().then(function(response){

                    $scope.zones = response.data.data; // Lista de Zonas que contienen mesas

                    //////////////////////////////////////////////////////////////////////////////////// 
                    //Se crea crea el metodo para poder identificar cual es la clase que esta seleccionada  
                    ////////////////////////////////////////////////////////////////////////////////////
                    angular.forEach($scope.zones, function(zona, key) {

                        angular.forEach(zona.tables, function(mesa, i) {

                            // Iteracion para identificar las mesas bloqueadas 
                            for(var p=0; p < mesasBloqueadas.length; p++){

                                if(mesa.id == mesasBloqueadas[p]){
                                    $scope.zones[key].tables[i].class = "selected-table";
                                }

                            }
                            // Iteracion para mostrar mesas bloqueadas en el mismo rango de fechas bloqueadas 

                        });    

                    });
                    //////////////////////////////////////////////////////////////////////////////////////
            });  
        }).then(function(){

              // Se obtiene de array de las mesas que estan en ese rango de fecha
              BlockFactory.getAllBlock("fecha="+$scope.fecha).then(function(response){
              
                console.log(response.data.data);
                var mesasFuturasBloqueadas = [];
                angular.forEach(response.data.data, function(mesaFuturaBloqueada, i) {
                    if(mesaFuturaBloqueada.res_block_id != block_id){
                        mesasFuturasBloqueadas.push(mesaFuturaBloqueada);
                    }

                });

                /////////////////////////////////////////////////////////////////////////////////////// 
                //Se agrega la clase para identificar los bloqueos futuros dentro del array principal  
                ///////////////////////////////////////////////////////////////////////////////////////
                angular.forEach($scope.zones, function(zona, key) {
                    angular.forEach(zona.tables, function(mesa, i) {
                            // Iteracion para identificar las mesas bloqueadas 
                            for(var p=0; p < mesasFuturasBloqueadas.length; p++){
                                //console.log(mesasFuturasBloqueadas);
                                if(mesa.id == mesasFuturasBloqueadas[p].res_table_id){
                                    $scope.zones[key].tables[i].classBloqueado = "selected-table-2";
                                }

                            }
                    // Iteracion para mostrar mesas bloqueadas en el mismo rango de fechas bloqueadas 
                    });    
                });
                //////////////////////////////////////////////////////////////////////////////////////
              });  
        });

        /** Pantalla Add Block **/
        $scope.shifts = [];
        $scope.startTimes = [];
        $scope.endTimes = [];
        $http.get(ApiUrlMesas + '/calendar/' + $stateParams.fecha+'/shifts').success(function(response) {
            angular.forEach(response.data, function(item, i) {
                if(item.turn != null){ // Se obtienes los Shifts que contienen datos

                     $scope.shifts.push({
                        id: item.id,
                        name: item.name,
                        startTimes: getRangoHours(item.turn.hours_ini, item.turn.hours_end),
                        endTimes: getRangoHours(addHourByMin(item.turn.hours_ini), item.turn.hours_end),
                     });

                    // Se muestra el primer array para cuando se esta creando el bloqueo
                    $scope.shift = $scope.shifts[0];
                    $scope.startTimes = $scope.shifts[0].startTimes;
                    $scope.endTimes = $scope.shifts[0].endTimes;       
                }
            });
        });    
        
        // Se muestran las mesas de la zona seleccionada   
        $scope.selectZone = function(item){
            angular.forEach($scope.zones, function(value, key){
                if(value.id == item.id){
                    $scope.itemTables = []; // Variable donde se cargan las mesas a mostrar
                    loadTablesEdit(value.tables);
                }
            });
        };


           // Se cambia el rango del shift elegido de acuerdo a la eleccion   
        $scope.changueRange = function(item){
            $scope.startTimes = item.startTimes;
            $scope.endTimes = item.endTimes;
         };

        $scope.coversList = {
            dataMin : [],
            selectedMin : '',
            dataMax : [],
            selectedMax : ''
        }

        $scope.boxTables = {
            items : true,
            item : false
        }

        
        var listCovers = function(option){

            var coverList = "";

            if (option == "min") {
                coverList = $scope.coversList.dataMin;
            }else{
                coverList = $scope.coversList.dataMax;
            }

            for (var i = 1; i <=30; i++) {
                var data = {
                    label : i+" covers",
                    id : i
                }

                coverList.push(data);
            }

            if (option == "min") {
                $scope.coversList.selectedMin = coverList[0];
            }else{
                $scope.coversList.selectedMax = coverList[0];
            }
        };
        
        
          /***************Funcion ejecutada por directiva****************/
          $scope.mesasBloqueadas = [];
          $scope.activarTableOptions = function(index,data){
                
            /************************************************************************************* 
            Se crea crea el metodo para poder identificar cual es la clase que esta seleccionada  
            **************************************************************************************/
                //Se carga la clase a la mesa para poder mostrar en el sistema
                var zoneSelect = $scope.zone;
                angular.forEach($scope.zones, function(value, key) {

                  if(value.id == zoneSelect.id){
                    $scope.zones[key].tables[index].class = "selected-table"; // Se carga una clase cuando se selecciona la mesa
                  }

                });
            /*************************************************************************************/

                $scope.mesasBloqueadas.push(data.id);

                /* Mensaje */
                var res = $scope.mesasBloqueadas.toString().replace(/,/g,", "); 
                $scope.someSafeContent = $sce.trustAsHtml("<b>" + res + "</b>");
          };
          
          $scope.desactivarTable = function (index,data) {


            /************************************************************************************* 
            Se crea crea el metodo para poder identificar cual es la clase que esta seleccionada  
            **************************************************************************************/
                //Se carga la clase a la mesa para poder mostrar en el sistema
                var zoneSelect = $scope.zone;
                angular.forEach($scope.zones, function(value, key) {

                  if(value.id == zoneSelect.id){
                    $scope.zones[key].tables[index].class = ""; // Se carga una clase cuando se selecciona la mesa
                  }

                });
            /*************************************************************************************/


            var item = $scope.mesasBloqueadas.indexOf(data.id);
            if(item > -1){
                data.class = "";
                $scope.mesasBloqueadas.splice(item, 1);
            }


            /* Mensaje */
            var res = $scope.mesasBloqueadas.toString().replace(/,/g,", "); 
            $scope.someSafeContent = $sce.trustAsHtml("<b>" + res + "</b>");

          }

        var getDataTableSelected = function(index){

            $scope.indexTable = index;

            angular.element("#name-table").val($scope.itemTables[index].name);
            $scope.changeShapeTable($scope.itemTables[index].shape);

            $scope.itemTables[index].top = angular.element("#tb-item"+index).css("top").replace("px","");
            $scope.itemTables[index].left = angular.element("#tb-item"+index).css("left").replace("px","");

            $scope.coversList.selectedMin = {
                id :$scope.itemTables[$scope.indexTable].minCover,
                label : $scope.itemTables[$scope.indexTable].minCover +" covers"
            };

            $scope.coversList.selectedMax = {
                id :$scope.itemTables[$scope.indexTable].maxCover,
                label : $scope.itemTables[$scope.indexTable].maxCover +" covers"
            };

            $scope.sizeTableList.selectedOption = {
                id : TableFactory.getIdSize($scope.itemTables[index].size),
                label : $scope.itemTables[index].size
            };
        };

        $scope.openCalendar = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.object = [];
        $scope.saveZone = function(option){
                
            if($scope.startTime == undefined || $scope.endTime == undefined || $scope.fecha == undefined ){
                
                messageAlert("Warning", "Tienes que seleccionar \"Start Time\", \"End Time\" y \"fecha\" ","warning",3000);

            }else{

                //Se arma la estrutura de datos
                $scope.object= {
                            start_date: $scope.fecha,
                            start_time: $scope.startTime.hour24,
                            end_time: $scope.endTime.hour24,
                            tables: [],
                            }

                //Se crea el array de mesas bloqueadas          
                for(var i=0; i<$scope.mesasBloqueadas.length; i++){
                    $scope.object.tables.push({id:$scope.mesasBloqueadas[i]});
                }
                  
                BlockFactory.editBlock("/" + block_id, $scope.object).then(function(response){
                    if(response.data.success === true){ 
                        messageAlert("Success", response.data.msg,"success",3000);
                    } else if(response.data.success == false ) {
                        messageAlert("Warning", response.data.msg,"warning",3000);
                    }
                });  

            }
            
        };
       
        /* Esta clase recorre las mesas listadas y crea un nuevo objeto dataTable que se iterara en la vista para imprimir las mesas * */
        var loadTablesEdit = function(tables){
            
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
                    $scope.itemTables.push(dataTable);
                }else{
                    $scope.itemTablesDeleted.push(dataTable);
                }

            });

        };

        listCovers("min");
        listCovers("max");
    });