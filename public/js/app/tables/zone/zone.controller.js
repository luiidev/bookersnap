angular.module('zone.controller', ['ngDraggable'])

.controller('ZoneCtrl', function($scope, ZoneFactory, MenuConfigFactory, $uibModal) {

        $scope.zonesActive = {};
        $scope.zonesInactive = {};

        $scope.idZoneDelete = 0;
        $scope.indexRow = 0;

        $scope.zones = {
            numTablesActive: 0,
            numTablesInactive: 0,
            minCoversActive: 0,
            maxCoversActive: 0,
            minCoversInactive: 0,
            maxCoversInactive: 0
        };

        var init = function() {
            $scope.getZones(false);
            MenuConfigFactory.menuActive(0);
        };

        $scope.getZones = function(reload) {

            ZoneFactory.getZones("with=turns", reload).success(function(data) {

                // console.log("zones " + angular.toJson(data, true));

                var vZonesActive = [];
                var vZonesInactive = [];

                angular.forEach(data.data, function(zones) {

                    var zonesTables = getTablesCount(zones);
                    var zonesTurn = zones.turns;

                    // console.log("getZones " + angular.toJson(zones.turns, true));

                    if (zones.status == "0" || zones.status == "2" || zonesTurn.length === 0) {
                        $scope.zones.numTablesInactive += zonesTables.tables_count;
                        $scope.zones.minCoversInactive += zonesTables.min_covers;
                        $scope.zones.maxCoversInactive += zonesTables.max_covers;
                        vZonesInactive.push(zonesTables);
                    } else {
                        $scope.zones.numTablesActive += zonesTables.tables_count;
                        $scope.zones.minCoversActive += zonesTables.min_covers;
                        $scope.zones.maxCoversActive += zonesTables.max_covers;
                        vZonesActive.push(zonesTables);
                    }

                });

                $scope.zonesActive = vZonesActive;
                $scope.zonesInactive = vZonesInactive;

            }).error(function(data, status, headers) {

                messageErrorApi(data, "Error", "warning", 0, true, status);
            });
        };

        $scope.deleteZoneConfirm = function(idZone, indexRow) {

            $scope.idZoneDelete = idZone;
            $scope.indexRow = indexRow;

            console.log("indexRow " + indexRow);

            var modalDeleteZone = $uibModal.open({
                animation: true,
                templateUrl: 'myModalDeleteZone.html',
                size: 'lg',
                controller: 'ModalZoneDeleteCtrl',
                resolve: {
                    idZone: function() {
                        return $scope.idZoneDelete;
                    },
                    indexRow: function() {
                        return $scope.indexRow;
                    },
                    zonesInactive: function() {
                        return $scope.zonesInactive;
                    }
                }
            });
        };

        var getTablesCount = function(zones) {
            var vTables = 0;
            var vMinCovers = 0;
            var vMaxCovers = 0;

            angular.forEach(zones.tables, function(tables) {
                if (tables.status == 1) {
                    vTables += 1;
                    vMinCovers += tables.min_cover;
                    vMaxCovers += tables.max_cover;
                }
            });

            zones.tables_count = vTables;
            zones.min_covers = vMinCovers;
            zones.max_covers = vMaxCovers;

            return zones;
        };

        init();
    })
    .controller('ZoneCreateCtrl', function($scope, $state, $stateParams, $document, ZoneFactory, ZoneLienzoFactory, TableFactory,
        $uibModal, IdMicroSitio, MenuConfigFactory) {

        $scope.sizeTableList = {
            data: [{
                id: "1",
                label: "small"
            }, {
                id: "2",
                label: "medium"
            }, {
                id: "3",
                label: "large"
            }],
            selectedOption: {
                id: "1",
                label: "small"
            }
        };

        $scope.coversList = {
            dataMin: [],
            selectedMin: '',
            dataMax: [],
            selectedMax: ''
        };

        $scope.headerZone = {
            tables: 0,
            minCovers: 0,
            maxCovers: 0
        };

        $scope.itemTables = [];
        $scope.itemTablesDeleted = [];

        $scope.boxTables = {
            items: true,
            item: false
        };

        $scope.typeDrag = "";

        $scope.indexTable = null;
        $scope.selectedTable = false; //validar al hacer click en el lienzo

        $scope.typeForm = "create"; // or edit

        $scope.saveClick = false; //valida click en guardar - no doble click

        var init = function() {
            detectedForm();

            listCovers("min");
            listCovers("max");

            MenuConfigFactory.menuActive(0);
        };

        $scope.onDragComplete = function(data, evt, type) {
            $scope.typeDrag = type;
            selectTableTypeDrag(data, type);
        };

        $scope.onDropComplete = function(data, evt) {

            var position = ZoneLienzoFactory.positionTable(evt);

            data.top = position.y;
            data.left = position.x;
            data.rotate_text = "top";
            data.name = $scope.itemTables.length + 1;

            selectTableTypeDrop(data);

            $scope.typeDrag = "";
        };

        $scope.onLienzo = function() {

            if ($scope.indexTable !== null && $scope.selectedTable === false) {
                console.log("onLienzo");
                $scope.activarTablesItems();
            }

            $scope.selectedTable = false;
        };

        $scope.rotateTextTable = function(option) {
            ZoneLienzoFactory.changeRotationText(option, $scope.itemTables[$scope.indexTable], $scope.indexTable);
        };

        $scope.changeShapeTable = function(shape) {

            $scope.itemTables[$scope.indexTable].shape = shape;
            var rotateTable = $scope.itemTables[$scope.indexTable].rotate;

            if (shape == "square" && (rotateTable == 90 || rotateTable == 135)) {
                $scope.itemTables[$scope.indexTable].rotate = 0;
            }

            /*angular.element(".text-rotate .btn-group .shape").removeClass("active");
            angular.element(".shape." + shape + "s").addClass("active");*/
        };

        $scope.changeSizeTable = function() {
            $scope.itemTables[$scope.indexTable].size = $scope.sizeTableList.selectedOption.label;
        };

        $scope.editNameTable = function() {
            var texto = angular.element("#name-table").val();
            ZoneLienzoFactory.changeNameTable($scope.itemTables[$scope.indexTable], $scope.itemTables, texto);
        };

        $scope.tableCapacity = function(option) {

            if (option == "min") {
                $scope.itemTables[$scope.indexTable].minCover = $scope.coversList.selectedMin.id;
            } else {

                $scope.itemTables[$scope.indexTable].maxCover = $scope.coversList.selectedMax.id;
            }

            if ($scope.coversList.selectedMax.id < $scope.coversList.selectedMin.id) {

                $scope.itemTables[$scope.indexTable].minCover = $scope.coversList.selectedMax.id;
                $scope.itemTables[$scope.indexTable].maxCover = $scope.coversList.selectedMax.id;

                getDataTableSelected($scope.indexTable);
            }

            updateHeaderZone();
        };

        $scope.rotateShapeTable = function() {

            console.log("rotateShapeTable ", $scope.itemTables[$scope.indexTable].rotate);

            console.log(angular.toJson($scope.itemTables[$scope.indexTable], true));

            var rotateTable = $scope.itemTables[$scope.indexTable].rotate;
            var shapeTable = $scope.itemTables[$scope.indexTable].shape;

            if (rotateTable == "0") {
                $scope.itemTables[$scope.indexTable].rotate = "45";
            } else {
                if (rotateTable == "45" && shapeTable == "recta") {
                    $scope.itemTables[$scope.indexTable].rotate = "90";
                } else if (rotateTable == "90" && shapeTable == "recta") {
                    $scope.itemTables[$scope.indexTable].rotate = "135";
                } else {
                    $scope.itemTables[$scope.indexTable].rotate = "0";
                }

            }
        };

        $scope.draggableTable = function() {
            console.log("draggableTable prueba");
        };

        $scope.activarTableOptions = function(index, vthis) {

            $scope.selectedTable = true;
            getDataTableSelected(index);

            setTimeout(function() {
                $scope.$apply(function() {

                    if ($scope.boxTables.item === false || ($scope.boxTables.item === true && $scope.selectedTable === true && angular.element('.item-drag-table').hasClass('selected-table') === false)) {

                        $scope.boxTables.item = true;
                        $scope.boxTables.items = false;
                    } else {

                        if (angular.element('.item-drag-table').hasClass('selected-table') === false) {

                            $scope.boxTables.item = false;
                            $scope.boxTables.items = true;
                        }

                    }
                });
            }, 100);
        };

        $scope.doneTableSelected = function() {
            $scope.activarTablesItems();
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

        $scope.activarTablesItems = function() {
            ZoneLienzoFactory.activarTablesItems($scope.boxTables);
        };

        $scope.deleteSelectTableItem = function() {

            var modalDeleteTable = $uibModal.open({
                animation: true,
                templateUrl: 'myModalDeleteTable.html',
                size: 'lg',
                controller: 'ModalTableDeteleCtrl',
                resolve: {
                    itemTables: function() {
                        return $scope.itemTables;
                    },
                    itemTablesDeleted: function() {
                        return $scope.itemTablesDeleted;
                    },
                    indexTable: function() {
                        return $scope.indexTable;
                    },
                    boxTables: function() {
                        return $scope.boxTables;
                    },
                    headerZone: function() {
                        return $scope.headerZone;
                    },
                    typeForm: function() {
                        return $scope.typeForm;
                    }

                }
            });
        };

        var selectTableTypeDrag = function(data) {
            var index = $scope.itemTables.indexOf(data);
            if (index > -1) {
                $scope.itemTables.splice(index, 1);
            }
        };

        var selectTableTypeDrop = function(data) {
            var index = $scope.itemTables.indexOf(data);
            if (index == -1)
                data.id = 0;
            data.status = 1;

            $scope.itemTables.push(data);
            updateHeaderZone();
        };

        var updateHeaderZone = function() {
            ZoneLienzoFactory.updateHeaderZone($scope.headerZone, $scope.itemTables);
        };

        var getDataTables = function(table) {

            var tableItem = {
                name: table.name,
                min_cover: table.minCover,
                max_cover: table.maxCover,
                config_position: table.left + "," + table.top, //x,y
                config_size: TableFactory.getIdSize(table.size),
                config_rotation: table.rotate,
                config_rotation_text: TableFactory.getIdRotationText(table.rotate_text),
                config_forme: TableFactory.getIdShape(table.shape),
                id: table.id,
                status: table.status
            };

            return tableItem;
        };

        var prepareDataTablesSave = function() {
            var tables = [];

            angular.forEach($scope.itemTables, function(table) {

                var tableItem = getDataTables(table);

                tables.push(tableItem);

            });

            if ($scope.typeForm == "edit") {

                angular.forEach($scope.itemTablesDeleted, function(table) {

                    var tableItem = getDataTables(table);

                    tables.push(tableItem);

                });

            }

            console.log("prepareDataTablesSave " + angular.toJson(tables, true));

            return tables;
        };

        $scope.saveZone = function(option) {
            var dataZone = {
                name: angular.element("#zone_name").val(),
                ms_microsite_id: IdMicroSitio,
                tables: prepareDataTablesSave()
            };

            $scope.saveClick = true;

            if (option == "create") {

                ZoneFactory.createZone(dataZone).success(function(response) {
                    messageAlert("Success", "Zona creada correctamente", "success", 0, true);
                    $state.reload();
                }).error(function(data, status, headers) {
                    $scope.saveClick = false;
                    messageErrorApi(data, "Error", "warning", 0, true);
                });

            } else {
                dataZone.id = $stateParams.id;
                ZoneFactory.editZone(dataZone).success(function(response) {
                    messageAlert("Success", "Zona actualizada correctamente", "success", 0, true);
                    $state.go('mesas.zone.active');
                }).error(function(data, status, headers) {
                    $scope.saveClick = false;
                    messageErrorApi(data, "Error", "warning", 0, true);
                });
            }

            console.log("saveZone " + angular.toJson(dataZone, true));
        };

        var detectedForm = function() {
            if ($stateParams.id !== undefined) {

                $scope.typeForm = "edit";

                ZoneFactory.getZone($stateParams.id).success(function(zone) {

                    angular.element("#zone_name").val(zone.data.name);

                    loadTablesEdit(zone.data.tables);
                });
            }
        };

        var loadTablesEdit = function(tables) {

            angular.forEach(tables, function(data) {

                var position = data.config_position.split(",");
                var dataTable = {
                    name: data.name,
                    minCover: data.min_cover,
                    maxCover: data.max_cover,
                    left: position[0],
                    top: position[1],
                    shape: TableFactory.getLabelShape(data.config_forme),
                    size: TableFactory.getLabelSize(data.config_size),
                    rotate: data.config_rotation,
                    rotate_text: TableFactory.getRotationText(data.config_rotation_text),
                    id: data.id,
                    status: data.status
                };

                if (data.status == 1) {
                    $scope.itemTables.push(dataTable);
                } else {
                    $scope.itemTablesDeleted.push(dataTable);
                }

            });

            console.log("loadTablesEdit " + angular.toJson($scope.itemTables, true));

            updateHeaderZone();
        };

        init();
    })
    .controller('ModalTableDeteleCtrl', function($scope, $uibModalInstance, itemTables, itemTablesDeleted, indexTable, boxTables, headerZone, typeForm, ZoneLienzoFactory) {

        $scope.ok = function() {
            //show tables items
            ZoneLienzoFactory.activarTablesItems(boxTables);

            removeTableItem();

            ZoneLienzoFactory.updateHeaderZone(headerZone, itemTables);

            $uibModalInstance.close();
        };

        var removeTableItem = function() {

            //add table in tables removes

            if (typeForm == "edit") {

                itemTables[indexTable].status = 2;

                itemTablesDeleted.push(itemTables[indexTable]);
            }

            //delete item table selected
            itemTables.splice(indexTable, 1);
            angular.element('.item-drag-table').removeClass('selected-table');

        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    })
    .controller('ModalZoneDeleteCtrl', function($scope, ZoneFactory, $uibModalInstance, idZone, indexRow, zonesInactive) {

        $scope.deleteZone = function() {
            ZoneFactory.deleteZone(idZone).success(function(response) {
                console.log("deleteZone msg " + response);

                messageAlert("Success", "Zone deleted", "success");

                zonesInactive.splice(indexRow, 1);
                $uibModalInstance.close();

            }).error(function(data, status, headers) {
                messageErrorApi(data, "Error", "warning");
            });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    })
    .controller('ZoneAssignTurnCtrl', function($scope, TypeTurnFactory, TurnFactory, $uibModal, $filter) {

        $scope.typeTurns = {};

        $scope.days = getDaysWeek();

        $scope.turns = [];

        $scope.turnDay = {
            id: 0,
            name: 'Selected turn'
        };

        $scope.getTurnsByType = function(typeTurn) {

            var vTurns = [$scope.turnDay];

            angular.forEach($scope.turns, function(data) {
                if (data.type.id == typeTurn) {
                    //data.name = data.name +" ("+data.hours_ini +" "+ data.hours_end +")";
                    vTurns.push(data);
                }
            });

            return vTurns;
        };

        $scope.selectTurno = function(typeTurn, turn, day) {

            var vData = {
                day: day,
                res_turn_id: turn.id,
                res_type_turn: typeTurn.id
            };

            console.log("selectTurno " + angular.toJson(vData, true));
        };

        var getTypeTurns = function() {

            TypeTurnFactory.getTypeTurns().success(function(data) {

                $scope.typeTurns = data;

            }).error(function(data, status, headers) {

                messageErrorApi(data, "Error", "warning");

            });
        };

        var getTurns = function() {

            TurnFactory.getTurns().success(function(data) {

                console.log("getTurnss " + angular.toJson(data.data, true));

                $scope.turns = data.data;

            }).error(function(data, status, headers) {

                messageErrorApi(data, "Error", "warning");

            });
        };

        getTurns();
        getTypeTurns();
    });