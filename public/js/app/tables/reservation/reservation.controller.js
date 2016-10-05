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
        angular.forEach(vm.zones, function(zone) {
            angular.forEach(zone.tables, function(table) {
                if (table.selected) {
                    var access = {};
                    access.name = table.name;
                    access.min = table.minCover;
                    access.max = table.maxCover;
                    vm.reservation.tables[table.id] = access;
                } else {
                    delete vm.reservation.tables[table.id];;
                }
            });
        });
        vm.tablesSelected = Object.keys(vm.reservation.tables).length;

        alertConflicts();
    };

    vm.selectTable = function(table) {
        table.selected = !table.selected;
        listTableSelected();
    };

    vm.tablesSuggested = function(cant){
        var SuggestedEstablished = false;
        angular.forEach(vm.zones, function(zone) {
            angular.forEach(zone.tables, function(table) {
                if (cant >= table.minCover && cant <= table.maxCover) {
                    if (!SuggestedEstablished) {
                        vm.tableSuggested = table.name;
                        SuggestedEstablished = true;
                    }
                    table.suggested = true;
                } else {
                    table.suggested = false;
                }
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
            });
    };

    var listHours = function(turns) {
        service.getHours(turns)
            .then(function(data) {
                vm.hours = data.hours;
                vm.reservation.hour = data.default;
            }).catch(function(error) {
                message.apiError(error);
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
    };

    vm.prevZone = function() {
        if (zoneIndexMax >= 0){
            if (vm.zoneIndex - 1 >= 0) {
                vm.zoneIndex --;
            } else {
                vm.zoneIndex = zoneIndexMax ;
            }
        }
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
                }).finally(function() {
                    listDurations();
                });

    };

    var loadTablesEdit = function(dataZones) {
        vm.zones = helper.loadTable(dataZones);
        defaultView();
    };

    var defaultView = function() {
        zoneIndexMax =  vm.zones.length - 1;
        if (zoneIndexMax >= 0) {
            vm.zoneName = vm.zones[0].name;
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