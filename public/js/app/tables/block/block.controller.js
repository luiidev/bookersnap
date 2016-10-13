angular.module('block.controller', [])
    .controller('blockCtr', function($scope, $http, $state, $sce, $stateParams, $document, $window, screenHelper, screenSizeBlock,
        ApiUrlMesas, BlockFactory, ZoneFactory, ZoneLienzoFactory, TableFactory, CalendarService, reservationService, $uibModal, IdMicroSitio) {

        $scope.date = null;
        $scope.zoneIndexShow = 0;

        $scope.coversList = BlockFactory.coverList();
        $scope.boxTables = BlockFactory.boxTables();

        $scope.object = [];
        $scope.zones = [];

        /** Carga la informacion de la pantalla add Block **/
        $scope.shifts = [];
        $scope.startTimes = [];
        $scope.endTimes = [];

        $scope.zone = null;

        var zoneIndexMax = 0;
        var zoneIndex = 0;

        var mesasFuturasBloqueadas = null;

        $scope.format = 'yyyy/MM/dd';
        var block_id = null;

        /***************Funcion ejecutado para agregar  o retirar una mesa bloqueada ****************/
        $scope.mesasBloqueadas = [];

        $scope.$watch("date", function(newValue, oldValue) {
            var fecha = convertFechaYYMMDD(newValue, "es-ES", {});
            var fechaOld = convertFechaYYMMDD(oldValue, "es-ES", {});

            if (fecha !== fechaOld) {
                listFormData(fecha);
            }
        });

        var listZones = function() {
            var fecha = convertFechaYYMMDD($scope.date, "es-ES", {});
            /* Listado array de zonas incluyendo sus zonas */
            reservationService.getZones(fecha, false).then(function(response) {
                $scope.zones = response.data.data; // Lista de Zonas que contienen mesas
                zoneIndexMax = $scope.zones.length;

                return $scope.zones;
            }).then(function(zonas) {

                // Se obtiene de array de las mesas que estan en ese rango de fecha
                BlockFactory.getAllBlock("date=" + fecha).then(function(response) {
                    mesasFuturasBloqueadas = response.data.data;

                    $scope.selectZone($scope.zones[0]);
                    //console.log("listZones " + angular.toJson($scope.zones, true));
                });
            });
        };

        $scope.loadBlockTables = function() {
            // console.log("mesasFuturasBloqueadas ", angular.toJson(mesasFuturasBloqueadas, true));

            var start_time = moment($scope.startTime.hour24, "HH:mm:ss");
            var end_time = moment($scope.endTime.hour24, "HH:mm:ss");

            angular.forEach($scope.zones, function(zona, key) {
                angular.forEach(zona.tables, function(mesa, i) {
                    // Iteracion para identificar las mesas bloqueadas 
                    for (var p = 0; p < mesasFuturasBloqueadas.length; p++) {

                        var start_block = moment(mesasFuturasBloqueadas[p].start_time, "HH:mm:ss");
                        var end_block = moment(mesasFuturasBloqueadas[p].end_time, "HH:mm:ss");

                        if (mesa.id == mesasFuturasBloqueadas[p].res_table_id) {

                            if ((start_time.isBetween(start_block, end_block, null, "()")) || (end_time.isBetween(start_block, end_block, null, "()")) ||
                                (start_time.isSameOrBefore(start_block) && end_time.isSameOrAfter(end_block))) {
                                $scope.zones[key].tables[i].classBloqueado = "block-table";
                            } else {
                                $scope.zones[key].tables[i].classBloqueado = "";
                            }
                        }
                    }
                    // Iteracion para mostrar mesas bloqueadas en el mismo rango de fechas bloqueadas 
                });
            });

            $scope.selectZone($scope.zones[0]);
        };

        var listFormData = function(fecha) {
            CalendarService.GetShiftByDate(fecha, {
                OnSuccess: function(Response) {
                    var data = Response.data;
                    angular.forEach(data.data, function(item, i) {
                        if (item.turn !== null) { // Se obtienes los Shifts que contienen datos

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
                },
                OnError: function(Response) {
                    console.log("error " + angular.toJson(Response, true));
                }
            });
        };

        var clearForm = function() {
            $scope.shifts = [];
        };

        var listTablesBlock = function() {
            BlockFactory.getBlock(block_id).then(function(response) {

                $scope.tableBlock = response.data.data;
                angular.forEach(response.data.data.tables, function(mesa, indexMesa) {
                    $scope.mesasBloqueadas.push(mesa.id);
                });

                BlockFactory.updateTablesBlocked($scope, $sce); // Actualizar mensaje

                return $scope.mesasBloqueadas;

            }).then(function(mesasBloqueadas) {

                return reservationService.getZones().then(function(response) {

                    $scope.zones = response.data.data;

                    angular.forEach($scope.zones, function(zona, key) {

                        angular.forEach(zona.tables, function(mesa, i) {
                            for (var p = 0; p < mesasBloqueadas.length; p++) {
                                if (mesa.id === mesasBloqueadas[p]) {
                                    $scope.zones[key].tables[i].class = "selected-table";
                                }
                            }
                        });
                    });

                    return $scope.zones;
                });


            }).then(function(zones) {
                // $scope.zones = zones;
                // Se obtiene de array de las mesas que estan en ese rango de fecha
                BlockFactory.getAllBlock("date=" + $scope.date, false).then(function(response) {

                    var mesasFuturasBloqueadas = [];
                    angular.forEach(response.data.data, function(mesaFuturaBloqueada, i) {
                        if (mesaFuturaBloqueada.res_block_id != block_id && mesaFuturaBloqueada.res_reservation_id === null) {
                            mesasFuturasBloqueadas.push(mesaFuturaBloqueada);
                        }
                    });
                    /////////////////////////////////////////////////////////////////////////////////////// 
                    //Se agrega la clase para identificar los bloqueos futuros dentro del array principal  
                    ///////////////////////////////////////////////////////////////////////////////////////

                    angular.forEach(zones, function(zona, key) {
                        angular.forEach(zona.tables, function(mesa, i) {
                            // Iteracion para identificar las mesas bloqueadas 
                            for (var p = 0; p < mesasFuturasBloqueadas.length; p++) {
                                if (mesa.id == mesasFuturasBloqueadas[p].res_table_id) {
                                    $scope.zones[key].tables[i].classBloqueado = "block";
                                }
                            }
                            // Iteracion para mostrar mesas bloqueadas en el mismo rango de fechas bloqueadas 
                        });
                    });

                    var indexStartTime = getIndexHour($scope.tableBlock.start_time, 0);
                    var indexEndTime = getIndexHour($scope.tableBlock.end_time, 0);

                    $scope.startTime = {
                        index: indexStartTime,
                        hour24: $scope.tableBlock.start_time
                    };

                    $scope.endTime = {
                        index: indexEndTime,
                        hour24: $scope.tableBlock.end_time
                    };

                    console.log("block ", angular.toJson($scope.tableBlock, true));

                });
            });
        };

        $scope.nextZone = function() {

            if (zoneIndex < zoneIndexMax - 1) {
                zoneIndex++;
            } else {
                if (zoneIndex >= zoneIndexMax - 1) {
                    zoneIndex = 0;
                }
            }
            console.log("nextZone ", zoneIndex);
            $scope.selectZone($scope.zones[zoneIndex]);
        };

        $scope.prevZone = function() {

            if (zoneIndex - 1 >= 0) {
                zoneIndex--;
            } else {
                zoneIndex = zoneIndexMax - 1;
            }

            console.log("prevZone " + zoneIndex);
            $scope.selectZone($scope.zones[zoneIndex]);
        };

        // Se muestran las mesas de la zona seleccionada   
        $scope.selectZone = function(item) {
            angular.forEach($scope.zones, function(value, key) {

                if (value.id == item.id) {
                    $scope.zoneIndexShow = key;
                    $scope.itemTables = []; // Variable donde se cargan las mesas a mostrar
                    $scope.zone = $scope.zones[key];
                    loadTablesEdit(value.tables);
                }
            });
        };

        // Se cambia el rango del shift elegido de acuerdo a la eleccion   
        $scope.changueRange = function(item) {
            $scope.startTimes = item.startTimes;
            $scope.endTimes = item.endTimes;
        };

        var listCovers = function(option) {

            var coverList = "";

            if (option == "min") {
                coverList = $scope.coversList.dataMin;
            } else {
                coverList = $scope.coversList.dataMax;
            }

            for (var i = 1; i <= 30; i++) {
                var data = {
                    label: i + " covers",
                    id: i
                };

                coverList.push(data);
            }

            if (option == "min") {
                $scope.coversList.selectedMin = coverList[0];
            } else {
                $scope.coversList.selectedMax = coverList[0];
            }
        };

        $scope.activarTableOptions = function(index, data) {
            console.log("activarTableOptions ", index);
            BlockFactory.checkTable($scope, $sce, index, data);
        };

        $scope.desactivarTable = function(index, data) {
            console.log("desactivarTableOptions ", index);
            BlockFactory.uncheckTable($scope, $sce, index, data);
        };

        var getDataTableSelected = function(index) {

            $scope.indexTable = index;

            angular.element("#name-table").val($scope.itemTables[index].name);
            $scope.changeShapeTable($scope.itemTables[index].shape);

            $scope.itemTables[index].top = angular.element("#tb-item" + index).css("top").replace("px", "");
            $scope.itemTables[index].left = angular.element("#tb-item" + index).css("left").replace("px", "");

            $scope.coversList.selectedMin = {
                id: $scope.itemTables[$scope.indexTable].minCover,
                label: $scope.itemTables[$scope.indexTable].minCover + " covers"
            };

            $scope.coversList.selectedMax = {
                id: $scope.itemTables[$scope.indexTable].maxCover,
                label: $scope.itemTables[$scope.indexTable].maxCover + " covers"
            };

            $scope.sizeTableList.selectedOption = {
                id: TableFactory.getIdSize($scope.itemTables[index].size),
                label: $scope.itemTables[index].size
            };
        };

        $scope.openCalendar = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.saveZone = function(option) {

            console.log("saveZone " + angular.toJson($scope.object, true));
            console.log("saveZone 2" + angular.toJson($scope.startTime, true));

            if ($scope.startTime === undefined || $scope.endTime === undefined || $scope.date === undefined) {

                messageAlert("Warning", "Tienes que seleccionar \"Start Time\", \"End Time\" y \"date\" ", "warning", 3000);

            } else {

                //Se arma la estrutura de datos
                $scope.object = {
                    start_date: convertFechaYYMMDD($scope.date, "es-ES", {}),
                    start_time: $scope.startTime.hour24,
                    end_time: $scope.endTime.hour24,
                    tables: [],
                };

                //Se crea el array de mesas bloqueadas          
                for (var i = 0; i < $scope.mesasBloqueadas.length; i++) {
                    $scope.object.tables.push({
                        id: $scope.mesasBloqueadas[i]
                    });
                }

                BlockFactory.addNewBlock($scope.object).then(function(response) {
                    if (response.data.success === true) {
                        messageAlert("Success", response.data.msg, "success", 3000);
                    } else if (response.data.response === false) {
                        messageAlert("Warning", response.data.jsonError, "warning", 2000);
                    }
                });

            }
        };

        /* Esta clase recorre las mesas listadas y crea un nuevo objeto dataTable que se iterara en la vista para imprimir las mesas * */
        var loadTablesEdit = function(tables) {
            BlockFactory.initItemTables($scope, tables, TableFactory);
        };

        $scope.selectAllTables = function() {
            BlockFactory.selectAllTables($scope, $sce, loadTablesEdit);
        };

        $scope.unselectAllTables = function() {
            BlockFactory.unselectAllTables($scope, $sce, loadTablesEdit);
        };

        angular.element($window).bind('resize', function() {
            var size = screenHelper.size(screenSizeBlock);
            $scope.size = size;
            $scope.$digest();
        });

        var setZoneName = function(i) {
            if (vm.zones.length)
                vm.zoneName = vm.zones[i].name;
        };

        (function Init() {

            $scope.date = convertFechaToDate($stateParams.date);

            listZones();
            listFormData($stateParams.date);
            $scope.size = screenHelper.size(screenSizeBlock);

            if ($stateParams.block_id !== null) {
                block_id = $stateParams.block_id;
                listTablesBlock();
            }
        })();

        listCovers("min");
        listCovers("max");
    });