angular.module('block.controller', [])
.controller('blockCtr', function($scope,$http, $state, $sce,$stateParams,$document, ApiUrlMesas,BlockFactory, ZoneFactory,ZoneLienzoFactory,TableFactory,$uibModal,IdMicroSitio) {

        $scope.date = $stateParams.date;

         /* Listado array de zonas incluyendo sus zonas */
        ZoneFactory.getZones().then(function(response){
            $scope.zones = response.data.data; // Lista de Zonas que contienen mesas
            return $scope.zones;
        }).then(function(zonas){
                
              // Se obtiene de array de las mesas que estan en ese rango de fecha
              BlockFactory.getAllBlock("date="+$scope.date).then(function(response){
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

        });  

        /** Carga la informacion de la pantalla add Block **/
        $scope.shifts = [];
        $scope.startTimes = [];
        $scope.endTimes = [];
        $http.get(ApiUrlMesas + '/calendar/' + $stateParams.date+'/shifts').success(function(response) {
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

        $scope.coversList = BlockFactory.coverList();
        $scope.boxTables = BlockFactory.boxTables();

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

        
        /***************Funcion ejecutado para agregar  o retirar una mesa bloqueada ****************/
          $scope.mesasBloqueadas = [];
          $scope.activarTableOptions = function(index,data){
            BlockFactory.checkTable($scope,$sce, index, data); 
          };
          
          $scope.desactivarTable = function (index,data) {
            BlockFactory.uncheckTable($scope, $sce, index, data); 
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
            

            if($scope.startTime == undefined || $scope.endTime == undefined || $scope.date == undefined ){
                
                messageAlert("Warning", "Tienes que seleccionar \"Start Time\", \"End Time\" y \"date\" ","warning",3000);

            }else{

                //Se arma la estrutura de datos
                $scope.object= {
                            start_date: $scope.date,
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
            BlockFactory.initItemTables($scope, tables, TableFactory);
        };  
        
        $scope.selectAllTables = function(){
           BlockFactory.selectAllTables($scope, $sce, loadTablesEdit);
        }

        $scope.unselectAllTables = function(){
           BlockFactory.unselectAllTables($scope, $sce,loadTablesEdit);            
        }


        listCovers("min");
        listCovers("max");
    })

.controller('blockCtrEdit', function($scope,$http, $sce, $state,$stateParams,$document, ApiUrlMesas,BlockFactory, ZoneFactory,ZoneLienzoFactory,TableFactory,$uibModal,IdMicroSitio) {

        $scope.date = $stateParams.date;
        var block_id = $stateParams.block_id;
        
        // Se trae la informacion del bloqueo para poder mostrar las tablas y editar
        BlockFactory.getBlock(block_id).then(function(response){

            $scope.tableBlock = response.data.data;
            angular.forEach(response.data.data.tables, function(mesa, indexMesa) {
                    $scope.mesasBloqueadas.push(mesa.id);    
            });

            BlockFactory.updateTablesBlocked($scope, $sce); // Actualizar mensaje
  
            return $scope.mesasBloqueadas;
    
        }).then(function (mesasBloqueadas){

                // Listado array de zonas incluyendo sus zonas 
                ZoneFactory.getZones().then(function(response){

                    $scope.zones = response.data.data; // Lista de Zonas que contienen mesas

                    ////////////////////////////////////////////////////////////////////////////////////////
                    //Se crea crea el metodo para poder identificar cual es la clase que esta seleccionada// 
                    ////////////////////////////////////////////////////////////////////////////////////////
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
            BlockFactory.getAllBlock("date="+$scope.date).then(function(response){
              
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

        /** carga la información de la pantalla edit Block **/
        $scope.shifts = [];
        $scope.startTimes = [];
        $scope.endTimes = [];
        $http.get(ApiUrlMesas + '/calendar/' + $stateParams.date+'/shifts').success(function(response) {
            angular.forEach(response.data, function(item, i) {
                if(item.turn != null){ // Se obtienes los Shifts que contienen datos

                     $scope.shifts.push({
                        id: item.id,
                        name: item.name,
                        startTimes: getRangoHours(item.turn.hours_ini, item.turn.hours_end),
                        endTimes: getRangoHours(addHourByMin(item.turn.hours_ini), item.turn.hours_end),
                     });

                     /* Rango de horas */
                     rangoInicialItem = item.turn.hours_ini;
                     rangoFinalItem = item.turn.hours_end;

                     rangoInicialTableBlock = $scope.tableBlock.start_time;
                     rangoFinalTableBlock = $scope.tableBlock.end_time;

                     console.log("item ini:", rangoInicialItem);
                     console.log("item end:", rangoFinalItem);
                     console.log("scope ini:", rangoInicialTableBlock);
                     console.log("scope end:", rangoFinalTableBlock);

                     if(rangoInicialTableBlock >= rangoInicialItem && rangoFinalTableBlock <= rangoFinalItem){

                        var indexFound = $scope.shifts.length - 1;
                        $scope.shift = $scope.shifts[indexFound];

                        angular.forEach($scope.shifts[indexFound].startTimes, function(startTime, i) {
                            if(startTime.hour24 == rangoInicialTableBlock){
                                
                                $scope.startTimes = $scope.shifts[indexFound].startTimes;
                                $scope.endTimes = $scope.shifts[indexFound].endTimes;

                                $scope.startTime = $scope.shifts[indexFound].startTimes[i];
                                $scope.endTime = $scope.shifts[indexFound].endTimes[i];
                            }
                            /*
                            */
                        }); 
                     }

                    /*
                    $scope.shift = $scope.shifts[0];
                    $scope.startTimes = $scope.shifts[0].startTimes;
                    $scope.endTimes = $scope.shifts[0].endTimes;
                    */       
                }
            });

            /* Se busca si el rango coincide con el editar */
            // console.log($scope.shifts);
            // Se muestra el primer array para cuando se esta creando el bloqueo
            //console.log($scope.tableBlock.start_time);
            //console.log($scope.tableBlock.end_time);

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

        $scope.coversList = BlockFactory.coverList();
        $scope.boxTables = BlockFactory.boxTables();
        
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
        
        
          /***************Funcion ejecutado para agregar  o retirar una mesa bloqueada ****************/
          $scope.mesasBloqueadas = [];
          $scope.activarTableOptions = function(index,data){
            BlockFactory.checkTable($scope,$sce, index, data); 
          };
          
          $scope.desactivarTable = function (index,data) {
            BlockFactory.uncheckTable($scope, $sce, index, data); 
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


        $scope.deleteBlock = function(){
            
            // Se obtiene de array de las mesas que estan en ese rango de fecha
            BlockFactory.deleteBlock(block_id).then(function(response){
                if(response.data.success == true){
                    messageAlert("Success",response.data.msg,"success",3000);
                } else if(response.data.success == false){
                    messageAlert("Warning",response.data.msg,"warning",3000);
                }           
            });  

        };

        $scope.object = [];
        $scope.saveZone = function(option){
                
            if($scope.startTime == undefined || $scope.endTime == undefined || $scope.date == undefined ){
                
                messageAlert("Warning", "Tienes que seleccionar \"Start Time\", \"End Time\" y \"date\" ","warning",3000);

            }else{

                //Se arma la estrutura de datos
                $scope.object= {
                            start_date: $scope.date,
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
            BlockFactory.initItemTables($scope, tables, TableFactory);
        };  

        $scope.selectAllTables = function(){
           BlockFactory.selectAllTables($scope, $sce, loadTablesEdit);
        }

        $scope.unselectAllTables = function(){
           BlockFactory.unselectAllTables($scope, $sce,loadTablesEdit);            
        }


        listCovers("min");
        listCovers("max");
    });