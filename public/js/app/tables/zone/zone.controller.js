angular.module('zone.controller', ['ngDraggable'])
    .controller('ZoneCtrl', function($scope, ZoneFactory, MenuConfigFactory, TurnDataFactory, $uibModal) {

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

        var getTurns = function(zones) {
            var options = getAsUriParameters({
                with: "zones|type_turn|calendar"
            });

            TurnDataFactory.getTurns(options).then(
                function success(response) {
                    response = response.data.data;
                    zonesData(zones, response);
                },
                function error(response) {
                    console.error("getTurns error " + angular.toJson(response, true));
                }
            );
        };

        var zonesData = function(zones, turns) {

            var zonesActive = [];
            var zonesInactive = [];

            angular.forEach(zones, function(zone) {
                var isActiveZone = false;

                angular.forEach(zone.turns, function(turnZone, key) {

                    var isActive = activeZoneTurn(turns, turnZone.id);

                    if (isActive) {
                        isActiveZone = isActive;
                        return;
                    }
                });

                if (isActiveZone) {

                    $scope.zones.numTablesActive += zone.tables_count;
                    $scope.zones.minCoversActive += zone.min_covers;
                    $scope.zones.maxCoversActive += zone.max_covers;

                    zonesActive.push(zone);

                } else {

                    $scope.zones.numTablesInactive += zone.tables_count;
                    $scope.zones.minCoversInactive += zone.min_covers;
                    $scope.zones.maxCoversInactive += zone.max_covers;

                    zonesInactive.push(zone);
                }
            });

            $scope.zonesActive = zonesActive;
            $scope.zonesInactive = zonesInactive;
        };

        var activeZoneTurn = function(turns, turnId) {
            var active = false;
            angular.forEach(turns, function(turn, key) {
                if (turn.id == turnId && turn.calendar.length > 0) {
                    active = true;
                }
            });
            return active;
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

        $scope.getZones = function(reload) {
            ZoneFactory.getZones("with=turns", reload).then(
                function success(data) {
                    data = data.data.data;
                    var zonesData = [];

                    angular.forEach(data, function(zones) {
                        var zonesTables = getTablesCount(zones);
                        zonesData.push(zonesTables);
                    });

                    return zonesData;
                }
            ).then(function(zones) {
                getTurns(zones);
            });
        };

        $scope.deleteZoneConfirm = function(idZone) {
            var options = {
                showCancelButton: true,
                confirmButtonText: "Si",
                cancelButtonText: "No",
            };

            message.confirmButton("Eliminar zona", "¿Estas seguro que deseas eliminar la zona ?", "info", options, function() {
                ZoneFactory.deleteZone(idZone).success(function(response) {

                    messageAlert("Operación exitosa", "Zona eliminada", "success");
                    $scope.getZones(true);

                }).error(function(data, status, headers) {
                    messageErrorApi(data, "Error", "warning");
                });
            });
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
            return tables;
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

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
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
    });