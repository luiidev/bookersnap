angular.module('block.service', [])
    .factory('BlockFactory', function($http, ApiUrlMesas, HttpFactory) {
        var zonesCalendar;
        var blocksAll;
        var blocks;
        var block;
        return {
            getZonesCalendar: function(date, reload) {
                zonesCalendar = HttpFactory.get(ApiUrlMesas + "/calendar/" + date + "/zones", {}, zonesCalendar, reload);
                return zonesCalendar;
            },
            getAllBlock: function(vDate, reload) {
                return $http.get(ApiUrlMesas + "/blocks/tables?" + vDate);
            },
            getBlocks: function(reload, params) {
                params = (params === undefined || params === null) ? "" : params;
                blocks = HttpFactory.get(ApiUrlMesas + "/blocks?" + params, null, blocks, reload);
                return blocks;
            },
            getBlock: function(vId, reload) {
                return $http.get(ApiUrlMesas + "/blocks/" + vId);
            },
            saveBlock: function(data) {
                return $http.post(ApiUrlMesas + "/blocks", data);
            },
            deleteBlock: function(id_block) {
                return $http.delete(ApiUrlMesas + "/blocks/" + id_block);
            },
            editBlock: function(id_block, data) {
                return $http.put(ApiUrlMesas + "/blocks/" + id_block, data);
            },
            coverList: function() {
                return {
                    dataMin: [],
                    selectedMin: '',
                    dataMax: [],
                    selectedMax: ''
                };
            },
            boxTables: function() {
                return {
                    items: true,
                    item: false
                };
            },
            updateTablesBlocked: function(scope, sce) {
                var res = scope.mesasBloqueadas.toString().replace(/,/g, ", ");
                scope.someSafeContent = sce.trustAsHtml("<b>" + res + "</b>");
            },
            checkTable: function(scope, sce, index, data) {

                //Se crea crea el metodo para poder identificar cual es la clase que esta seleccionada  
                //Se carga la clase a la mesa para poder mostrar en el sistema
                var zoneSelect = scope.zone;
                angular.forEach(scope.zones, function(value, key) {

                    if (value.id == zoneSelect.id) {
                        scope.zones[key].tables[index].class = "selected-table";
                    }

                });

                scope.mesasBloqueadas.push(data.id);
                this.updateTablesBlocked(scope, sce);
            },
            uncheckTable: function(scope, sce, index, data) {

                //Se crea crea el metodo para poder identificar cual es la clase que esta seleccionada  
                //Se carga la clase a la mesa para poder mostrar en el sistema
                var zoneSelect = scope.zone;
                angular.forEach(scope.zones, function(value, key) {

                    if (value.id == zoneSelect.id) {
                        scope.zones[key].tables[index].class = "";
                    }

                });

                var item = scope.mesasBloqueadas.indexOf(data.id);

                if (item > -1) {
                    data.class = "";
                    scope.mesasBloqueadas.splice(item, 1);
                }

                this.updateTablesBlocked(scope, sce);
            },
            selectAllTables: function(scope, sce, loadTablesEdit) {

                var zoneIndexShow = scope.zoneIndexShow;

                angular.forEach(scope.zones[zoneIndexShow].tables, function(mesa, i) {
                    scope.zones[zoneIndexShow].tables[i].class = "selected-table";
                    // Se agrega la mesa bloqueada en el array de mesasBloqueadas
                    if (scope.mesasBloqueadas.indexOf(scope.zones[zoneIndexShow].tables[i].id) == -1) {
                        scope.mesasBloqueadas.push(scope.zones[zoneIndexShow].tables[i].id);
                    }
                });

                this.updateTablesBlocked(scope, sce);

                var posicion = scope.zones.indexOf(scope.zone);
                if (posicion != -1) {
                    var item = scope.zones[posicion];
                    angular.forEach(scope.zones, function(value, key) {
                        if (value.id == item.id) {
                            scope.itemTables = []; // Variable donde se cargan las mesas a mostrar
                            loadTablesEdit(value.tables);
                        }
                    });
                }
            },
            unselectAllTables: function(scope, sce, loadTablesEdit) {

                var zoneIndexShow = scope.zoneIndexShow;

                // Se remuven todas las mesas bloqueadas de una zona
                angular.forEach(scope.zones[zoneIndexShow].tables, function(mesa, i) {
                    scope.zones[zoneIndexShow].tables[i].class = "";
                    var tableId = scope.zones[zoneIndexShow].tables[i].id;
                    var pos = scope.mesasBloqueadas.indexOf(tableId);
                    if (pos > -1) {
                        scope.mesasBloqueadas.splice(pos, 1);
                    }
                });

                this.updateTablesBlocked(scope, sce);

                var posicion = scope.zones.indexOf(scope.zone);
                if (posicion != -1) {
                    var item = scope.zones[posicion];
                    angular.forEach(scope.zones, function(value, key) {
                        if (value.id == item.id) {
                            scope.itemTables = []; // Variable donde se cargan las mesas a mostrar
                            loadTablesEdit(value.tables);
                        }
                    });
                }
            },
            initItemTables: function(scope, tables, TableFactory) {

                angular.forEach(tables, function(data) {

                    var position = data.config_position.split(",");
                    var dataTable = {
                        name: data.name,
                        class: data.class,
                        classBloqueado: data.classBloqueado,
                        minCover: data.min_cover,
                        maxCover: data.max_cover,
                        left: position[0],
                        top: position[1],
                        shape: TableFactory.getLabelShape(data.config_forme),
                        size: TableFactory.getLabelSize(data.config_size),
                        rotate: data.config_rotation,
                        id: data.id,
                        status: data.status
                    };

                    if (data.status == 1) {
                        scope.itemTables.push(dataTable);
                    } else {
                        scope.itemTablesDeleted.push(dataTable);
                    }

                });
            }

        };

    });