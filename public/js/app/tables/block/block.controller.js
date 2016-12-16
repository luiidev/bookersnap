angular.module('block.controller', [])
    .controller('blockCtr', function($scope, $http, $state, $sce, $stateParams, $document, $window, screenHelper, screenSizeBlock,
        ApiUrlMesas, BlockFactory, ZoneFactory, ZoneLienzoFactory, TableFactory, CalendarService, reservationService, $uibModal, IdMicroSitio) {

        $scope.date = null;
        $scope.zoneIndexShow = 0;

        $scope.itemTables = [];

        $scope.coversList = BlockFactory.coverList();
        $scope.boxTables = BlockFactory.boxTables();

        $scope.object = {};
        $scope.zones = [];

        //Carga la informacion de la pantalla add Block
        $scope.shifts = [];
        $scope.startTimes = [];
        $scope.endTimes = [];

        $scope.zone = null;

        var zoneIndexMax = 0;
        var zoneIndex = 0;

        var mesasFuturasBloqueadas = null;

        $scope.format = 'yyyy/MM/dd';
        var block_id = null;

        //Funcion ejecutado para agregar  o retirar una mesa bloqueada
        $scope.mesasBloqueadas = [];

        $scope.$watch("date", function(newValue, oldValue) {
            var fecha = convertFechaYYMMDD(newValue, "es-ES", {});
            var fechaOld = convertFechaYYMMDD(oldValue, "es-ES", {});

            if (fecha !== fechaOld) {
                    InitModule(fecha);
                // listFormData(fecha);
                // listZones(fecha);
            }
        });

        // var listZones = function(fecha) {
        //     //Listado array de zonas incluyendo sus zonas
        //     reservationService.getZones(fecha, true).then(
        //         function success(response) {
        //             $scope.zones = response.data.data; // Lista de Zonas que contienen mesas
        //             zoneIndexMax = $scope.zones.length;
        //             $scope.zone = $scope.zones[0];
        //             getAllTablesBlockFuture(fecha, true);

        //         },
        //         function error(response) {
        //             console.error("error " + angular.toJson(response, true));
        //         }
        //     );
        // };

        // var getAllTablesBlockFuture = function(fecha, reload) {
        //     // Se obtiene de array de las mesas que estan en ese rango de fecha
        //     BlockFactory.getAllBlock("date=" + fecha, reload).then(
        //         function success(response) {
        //             mesasFuturasBloqueadas = response.data.data;
        //             $scope.selectZone($scope.zones[0]);

        //             if ($stateParams.block_id !== undefined) {
        //                 block_id = $stateParams.block_id;
        //                 listTablesBlock();
        //             }
        //         },
        //         function error(response) {
        //             console.error("error " + angular.toJson(response, true));
        //         }
        //     );
        // };

        var exitsReservationTable = function(tableId) {
            var validate = false;
            angular.forEach(mesasFuturasBloqueadas, function(value, key) {
                if (tableId == value.res_table_id) {
                    if (value.res_reservation_id !== null && value.res_block_id == $stateParams.block_id) {
                        validate = true;
                    }

                }
            });

            return validate;
        };

        // var listTablesBlock = function() {
        //     BlockFactory.getBlock(block_id).then(function success(response) {

        //             $scope.tableBlock = response.data.data;

        //             angular.forEach(response.data.data.tables, function(mesa, indexMesa) {
        //                 $scope.mesasBloqueadas.push(mesa.id);
        //             });

        //             BlockFactory.updateTablesBlocked($scope, $sce);

        //             angular.forEach($scope.zones, function(zona, key) {
        //                 angular.forEach(zona.tables, function(mesa, i) {

        //                     for (var p = 0; p < $scope.mesasBloqueadas.length; p++) {

        //                         var exitsReservation = exitsReservationTable(mesa.id);

        //                         if (mesa.id === $scope.mesasBloqueadas[p] && exitsReservation === false) {
        //                             $scope.zones[key].tables[i].class = "selected-table";
        //                         }
        //                     }

        //                 });

        //                 $scope.selectZone($scope.zones[0]);

        //             });

        //             timesSelectedDefault($scope.tableBlock);
        //             $scope.loadBlockTables();

        //         },
        //         function error(response) {
        //             console.log("error " + angular.toJson(response, true));
        //         }
        //     );
        // };

        // selecciona turno,start_time y end_time  al cargar el bloqueo
        var timesSelectedDefault = function(blockData) {

            var start_time_block = moment(blockData.start_time, "HH:mm:ss");
            var end_time_block = moment(blockData.end_time, "HH:mm:ss");

            angular.forEach($scope.shifts, function(shift) {
                var start_time_shift = moment(shift.times.startTime, "HH:mm:ss");
                var end_time_shift = moment(shift.times.endTime, "HH:mm:ss");

                if ((start_time_shift.isBetween(start_time_block, end_time_block, null, "()")) ||
                    (end_time_block.isBetween(start_time_shift, end_time_shift, null, "()")) ||
                    (start_time_shift.isSameOrBefore(start_time_block) && end_time_shift.isSameOrAfter(end_time_block))) {

                    $scope.shift = shift;
                }

            });

            $scope.changueRange($scope.shift);

            $scope.startTime = {
                index: getIndexHour(blockData.start_time, 0),
                hour24: blockData.start_time
            };

            $scope.endTime = {
                index: getIndexHour(blockData.end_time, 0),
                hour24: blockData.end_time
            };
        };

        // var listFormData = function(fecha) {
        //     clearForm();
        //     CalendarService.GetShiftByDate(fecha).then(
        //         function OnSuccess(Response) {
        //             var data = Response.data;
        //             angular.forEach(data.data, function(item, i) {
        //                 if (item.turn !== null) { // Se obtienes los Shifts que contienen datos

        //                     $scope.shifts.push({
        //                         id: item.id,
        //                         name: item.name,
        //                         times: {
        //                             startTime: item.turn.hours_ini,
        //                             endTime: item.turn.hours_end
        //                         },
        //                         startTimes: getRangoHours(item.turn.hours_ini, item.turn.hours_end),
        //                         endTimes: getRangoHours(addHourByMin(item.turn.hours_ini), item.turn.hours_end, true),
        //                     });

        //                     // Se muestra el primer array para cuando se esta creando el bloqueo
        //                     $scope.shift = $scope.shifts[0];
        //                     $scope.startTimes = $scope.shifts[0].startTimes;
        //                     $scope.endTimes = $scope.shifts[0].endTimes;

        //                     if ($scope.startTimes.length > 0) {
        //                         $scope.startTime = $scope.startTimes[0];
        //                     }

        //                     if ($scope.endTimes.length > 0) {
        //                         $scope.endTime = $scope.endTimes[0];
        //                     }
        //                 }
        //             });
        //         },
        //         function OnError(Response) {
        //             console.log("error " + angular.toJson(Response, true));
        //         }
        //     );
        // };

        var clearForm = function() {
            $scope.shifts.length = 0;
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

        //Esta clase recorre las mesas listadas y crea un nuevo objeto dataTable que se iterara en la vista para imprimir las mesas
        var loadTablesEdit = function(tables) {
            BlockFactory.initItemTables($scope, tables, TableFactory);
        };

        var setZoneName = function(i) {
            if ($scope.zones.length){
                $scope.zoneName = $scope.zones[i].name;
            }
        };

        var saveBlock = function(blockData) {

            BlockFactory.saveBlock(blockData).then(
                function success(response) {
                    if (response.data.success === true) {
                        messageAlert("Success", response.data.msg, "success", 0, true);
                        redirect();
                    } else if (response.data.success === false) {
                        messageAlert("Warning", response.data.msg.join("\n"), "warning", 0, true);
                    }
                },
                function error(response) {
                    messageAlert("Warning", response.data.jsonError.join("\n"), "warning", 0, true);
                }
            );

        };

        var editBlock = function(id, blockData) {

            BlockFactory.editBlock(id, blockData).then(
                function success(response) {
                    if (response.data.success === true) {
                        messageAlert("Success", response.data.msg, "success", 3000, true);
                        redirect();
                    } else if (response.data.success === false) {
                        messageAlert("Warning", response.data.msg, "warning", 2000, true);
                    }
                },
                function error(response) {
                    messageErrorApi(response, "Error", "warning", 2000, true);
                }
            );

        };

        $scope.deleteBlock = function() {
            var options = {
                showCancelButton: true,
                confirmButtonText: "Si",
                cancelButtonText: "No",
            };
            message.confirmButton("Eliminar bloqueo", "¿Estas seguro que deseas eliminar este bloqueo ?", "info", options, function() {
                BlockFactory.deleteBlock($stateParams.block_id).then(
                    function success(response) {
                        if (response.data.success === true) {
                            messageAlert("Success", response.data.msg, "success", 3000, true);
                            redirect();
                        } else if (response.data.response === false) {
                            messageAlert("Warning", response.data.jsonError, "warning", 2000, true);
                        }
                    },
                    function error(response) {
                        messageErrorApi(response, "Error", "warning", 2000, true);
                    }
                );
            });
        };

        $scope.loadBlockTables = function() {

            if ($scope.endTime === null) {
                return;
            }

            var start_time = moment($scope.startTime.hour24, "HH:mm:ss");
            var end_time = moment($scope.endTime.hour24, "HH:mm:ss");

            angular.forEach($scope.zones, function(zona, key) {
                angular.forEach(zona.tables, function(mesa, i) {
                    // Iteracion para identificar las mesas bloqueadas 
                    for (var p = 0; p < mesasFuturasBloqueadas.length; p++) {

                        var start_block = moment(mesasFuturasBloqueadas[p].start_time, "HH:mm:ss");
                        var end_block = moment(mesasFuturasBloqueadas[p].end_time, "HH:mm:ss");

                        if (mesa.id == mesasFuturasBloqueadas[p].res_table_id) {

                            if (((start_time.isBetween(start_block, end_block, null, "()")) || (end_time.isBetween(start_block, end_block, null, "()")) ||
                                    (start_time.isSameOrBefore(start_block) && end_time.isSameOrAfter(end_block))) && mesasFuturasBloqueadas[p].res_reservation_id === null) {
                                if ($stateParams.block_id === undefined) {
                                    $scope.zones[key].tables[i].classBloqueado = "block-table";
                                } else if ($stateParams.block_id != mesasFuturasBloqueadas[p].res_block_id) {
                                    $scope.zones[key].tables[i].classBloqueado = "block-table";
                                }

                            } else {
                                $scope.zones[key].tables[i].classBloqueado = "";
                            }
                        }
                    }
                    // Iteracion para mostrar mesas bloqueadas en el mismo rango de fechas bloqueadas 
                });
            });

            $scope.selectZone($scope.zones[zoneIndex]);
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

            if (item === null) {
                return;
            }

            $scope.startTimes = item.startTimes;
            $scope.endTimes = item.endTimes;


            if ($scope.startTimes.length > 0) {
                $scope.startTime = $scope.startTimes[0];
            }

            if ($scope.endTimes.length > 0) {
                $scope.endTime = $scope.endTimes[0];
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

        $scope.openCalendar = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        var messages = [];

        $scope.saveZone = function(option) {
            var messages = [];
            if ($scope.date === undefined) {
                messages.push("Seleccione Fecha de reservacion");
            }

            if (!$scope.startTime) {
                messages.push("Seleccione Hora de inicio");
            }

            if (!$scope.endTime) {
                messages.push("Seleccione Hora final");
            }

            if (!$scope.mesasBloqueadas.length) {
                messages.push("Seleccione al menos una mesa a bloquear");
            }

            if (messages.length) {

                messageAlert("Alerta", messages.join("\n"), "warning", 3000, true);

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

                if (option == "create") {
                    saveBlock($scope.object);
                } else {
                    editBlock(block_id, $scope.object);
                }

            }
        };

        $scope.selectAllTables = function() {
            BlockFactory.selectAllTables($scope, $sce, loadTablesEdit);
        };

        $scope.unselectAllTables = function() {
            BlockFactory.unselectAllTables($scope, $sce, loadTablesEdit);
        };

        $scope.cancel = function() {
            return redirect();
        };

        var redirect = function() {
            if ($state.is("mesas.book.block") || $state.is("mesas.book.blockEdit")) {
                $state.go("mesas.book", $stateParams);
            } else {
                $state.go("mesas.floor.reservation");
            }
        };

        var resize = function() {
            $scope.size = screenHelper.size(screenSizeBlock);

            angular.element($window).bind('resize', function() {
                var size = screenHelper.size(screenSizeBlock);
                $scope.size = size;
                $scope.$digest();
            });
        };

        var clearData = function() {
            $scope.itemTables.length = 0;

            $scope.object = {};
            $scope.zones.length = 0;

            $scope.shifts.length = 0;
            $scope.startTimes.length = 0;
            $scope.endTimes.length = 0;

            $scope.zone = null;

            var zoneIndexMax = 0;
            var zoneIndex = 0;

            var mesasFuturasBloqueadas = null;

            $scope.mesasBloqueadas.length = 0;
            $scope.someSafeContent = "";
        };

        var InitModule = function(date) {
            if ($stateParams.block_id !== undefined) {
                block_id = $stateParams.block_id;
            }

            clearData();
            reservationService.blockMaster(date, block_id)
                .then(function(response) {
                    runZones(response.data.data.zones);
                    runShifts(response.data.data.shifts);
                    runBlocks(response.data.data.blockTables);
                    runBlock(response.data.data.block);
                }).catch(function(error) {
                    message.apiError(error);
                });
        };

        var runZones = function(zones) {
            $scope.zones = zones; // Lista de Zonas que contienen mesas
            zoneIndexMax = $scope.zones.length;
            $scope.zone = $scope.zones[0];
        };

        var runBlocks = function(blocks) {
            mesasFuturasBloqueadas = blocks;
            $scope.selectZone($scope.zones[0]);
        };

        var runBlock = function(block) {
            if (block === null) {
                return;
                // evaluar si el estado es editar, redireccionar.
            }

            $scope.tableBlock = block;

            angular.forEach($scope.tableBlock.tables, function(mesa, indexMesa) {
                $scope.mesasBloqueadas.push(mesa.id);
            });

            BlockFactory.updateTablesBlocked($scope, $sce);

            angular.forEach($scope.zones, function(zona, key) {
                angular.forEach(zona.tables, function(mesa, i) {

                    for (var p = 0; p < $scope.mesasBloqueadas.length; p++) {

                        var exitsReservation = exitsReservationTable(mesa.id);

                        if (mesa.id === $scope.mesasBloqueadas[p] && exitsReservation === false) {
                            $scope.zones[key].tables[i].class = "selected-table";
                        }
                    }

                });

                $scope.selectZone($scope.zones[0]);

            });

            timesSelectedDefault($scope.tableBlock);
            $scope.loadBlockTables();
        };

        runShifts = function(shifts) {
            clearForm();
            angular.forEach(shifts, function(item, i) {
                if (item.turn !== null) { // Se obtienes los Shifts que contienen datos

                    $scope.shifts.push({
                        id: item.id,
                        name: item.name,
                        times: {
                            startTime: item.turn.hours_ini,
                            endTime: item.turn.hours_end
                        },
                        startTimes: getRangoHours(item.turn.hours_ini, item.turn.hours_end),
                        endTimes: getRangoHours(addHourByMin(item.turn.hours_ini), item.turn.hours_end, true),
                    });

                    // Se muestra el primer array para cuando se esta creando el bloqueo
                    $scope.shift = $scope.shifts[0];
                    $scope.startTimes = $scope.shifts[0].startTimes;
                    $scope.endTimes = $scope.shifts[0].endTimes;

                    if ($scope.startTimes.length > 0) {
                        $scope.startTime = $scope.startTimes[0];
                    }

                    if ($scope.endTimes.length > 0) {
                        $scope.endTime = $scope.endTimes[0];
                    }
                }
            });
        };

        (function Init() {
            resize();

            $scope.date = convertFechaToDate($stateParams.date);

            InitModule($scope.date);

            // listZones($stateParams.date);
            // listFormData($stateParams.date);
        })();


    });