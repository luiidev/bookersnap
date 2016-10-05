angular.module('reservation.controller', [])
.controller("reservationCtrl.Index", [function(){

}])
.controller("reservationCtrl.Store", ["$scope", "ZoneLienzoFactory", "$window", "$stateParams",
    "reservationScreenHelper", "reservationService", "reservationHelper",
        function(vm, ZoneLienzoFactory, $window, $stateParams, screenHelper, service, helper){

    vm.reservation = {};
    vm.reservation.tables = {};
    vm.tablesSelected = 0;
    vm.conflicts = [];
    vm.zones = [];
    vm.zoneIndex = 0;
    vm.tableSuggested = "";
    var zoneIndexMax = 0;
    var blocks = [];

    vm.testJsonCreate = function() {
        var object = angular.copy(vm.reservation);
        object.tables = Object.keys(object.tables);
        console.log(object);
    };

    vm.selectTableAllOrNone = function(indicator) {
        if (indicator == "all") {
            angular.forEach(vm.zones[vm.zoneIndex].tables, function(table) {
                table.selected = true;
            });
        } else if (indicator == "none") {
            angular.forEach(vm.zones[vm.zoneIndex].tables, function(table) {
                table.selected = false;
            });
        }
        listTableSelected();
    };

    var alertConflicts = function() {
        vm.conflicts = [];
        angular.forEach(vm.reservation.tables, function(table, i) {
            if (vm.reservation.covers < table.min) {
                vm.conflicts.push(angular.copy(table));
            }
        });
    };

    var listTableSelected = function() {
        tablesForEach(function(table) {
            if (table.selected) {
                var access = {};
                access.name = table.name;
                access.min = table.minCover;
                access.max = table.maxCover;
                vm.reservation.tables[table.id] = access;
            } else {
                delete vm.reservation.tables[table.id];
            }
        });
        vm.tablesSelected = Object.keys(vm.reservation.tables).length;

        alertConflicts();
    };

    vm.selectTable = function(table) {
        table.selected = !table.selected;
        listTableSelected();
    };

    vm.tablesBlockValid = function() {
        var start_time =  moment(vm.reservation.hour, "HH:mm:ss");
        var auxiliar =  moment(vm.reservation.duration, "HH:mm:ss");
        var end_time = start_time.clone().add(auxiliar.hour(), "h").add(auxiliar.minute(), "m");

        angular.forEach(blocks, function(block){
            var start_block =  moment(block.start_time, "HH:mm:ss");
            var end_block =  moment(block.end_time, "HH:mm:ss");
            tablesForEach(function(table) {
                if (table.id == block.res_table_id) {
                    if (start_time.isBetween(start_block, end_block,  null, "()")) {
                        table.block = true;
                    } else if (end_time.isBetween(start_block, end_block, null, "()")) {
                        table.block = true;
                    } else if (start_time.isSameOrBefore(start_block) && end_time.isSameOrAfter(end_block)) {
                        table.block = true;
                    } else {
                        table.block = false;
                    }
                }
            });
        });
    };

    vm.tablesSuggested = function(cant){
        vm.tableSuggested = "";
        tablesForEach(function(table) {
            if (cant >= table.minCover && cant <= table.maxCover) {
                if (vm.tableSuggested  === "") vm.tableSuggested = table.name;
                table.suggested = true;
            } else {
                table.suggested = false;
            }
        });
    };

    var tablesOccupied = function() {
        // console.log("=)",blocks);
        angular.forEach(blocks, function(block){
            tablesForEach(function(table) {
                if (table.id == block.res_table_id) {
                    // console.log(table.id);
                    if (block.res_reservation_id !== null) {
                        table.occupied = true;
                        table.suggested = false;
                        // console.log("=)", table);
                    } 
                }
            });
        });
    };

    var tablesForEach = function(callback){
        angular.forEach(vm.zones, function(zone) {
            angular.forEach(zone.tables, function(table) {
                callback(table);
            });
        });
    };

    var listServers = function() {
        service.getServers()
            .then(function(response) {
                vm.servers = response.data.data;
            }).catch(function(error) {
                message.apiError(error);
            });
    };

    var listGuest = function() {
        service.getGuest()
            .then(function(guests) {
                vm.covers = guests;
                vm.reservation.covers = 2;
                vm.tablesSuggested(vm.reservation.covers);
            });
    };

    var listStatuses = function() {
        service.getStatuses()
            .then(function(response) {
                vm.statuses = response.data.data;
                if (vm.statuses.length) vm.reservation.status_id = vm.statuses[0].id;
            }).catch(function(error) {
                message.apiError(error);
            });
    };

    var listDurations = function() {
        service.getDurations()
            .then(function(durations) {
                vm.durations = durations;
                vm.reservation.duration = "01:30:00";
            }).catch(function(error) {
                message.apiError(error);
            }).finally(function() {
                vm.tablesBlockValid();
            });
    };

    var listHours = function(turns) {
        service.getHours(turns)
            .then(function(data) {
                vm.hours = data.hours;
                vm.reservation.hour = data.default;
            }).catch(function(error) {
                message.apiError(error);
            }).finally(function() {
                listDurations();
            });
    };

    vm.nextZone = function() {
        if (zoneIndexMax >= 0){
            if (vm.zoneIndex + 1 > zoneIndexMax) {
                vm.zoneIndex = 0;
            } else {
                vm.zoneIndex++;
            }
        }
        setZoneName(vm.zoneIndex);
    };

    vm.prevZone = function() {
        if (zoneIndexMax >= 0){
            if (vm.zoneIndex - 1 >= 0) {
                vm.zoneIndex --;
            } else {
                vm.zoneIndex = zoneIndexMax ;
            }
        }
        setZoneName(vm.zoneIndex);
    };

    var setZoneName = function(i) {
        vm.zoneName = vm.zones[i].name;
    };

    var loadZones = function() {
            var date = $stateParams.date;
            var valid = moment(date , 'YYYY-MM-DD', true).isValid();

            if (!valid) {
                return alert("Fecha invalida no se puede cargar las zonas");
            }

            service.getZones(date)
                .then(function(response) {
                    loadTablesEdit(response.data.data.zones);
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    listGuest();
                    listServers();
                    listStatuses();
                });

            service.getTurns(date)
                .then(function(response) {
                    var turns = response.data.data;
                    listHours(turns);
                }).catch(function(error) {
                    message.apiError(error);
                });

            service.getBlocks(date)
                .then(function(response) {
                    blocks = response.data.data;
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    tablesOccupied();
                });
    };

    var loadTablesEdit = function(dataZones) {
        vm.zones = helper.loadTable(dataZones);
        defaultView();
    };

    var defaultView = function() {
        zoneIndexMax =  vm.zones.length - 1;
        if (zoneIndexMax >= 0) {
            setZoneName(0);
        }
    };

    angular.element($window).bind('resize', function(){
        var size = screenHelper.size(vm);
        vm.size = size;
        vm.$digest();
    });

    (function Init() {
        loadZones();

        vm.size = screenHelper.size();
    })();
}]);