angular.module('reservation.controller', [])
.controller("reservationCtrl.Index", [function(){
    console.log("=)");
}])
.controller("reservationCtrl.Store", ["$scope", "ZoneLienzoFactory", "$window", "$stateParams", "$timeout",
    "reservationScreenHelper", "reservationService", "reservationHelper",
        function(vm, ZoneLienzoFactory, $window, $stateParams, $timeout, screenHelper, service, helper){

    vm.reservation = {};
    vm.tablesSelected = {};
    vm.isTablesSelected = 0;
    vm.conflicts = [];
    vm.zones = [];
    vm.zoneIndex = 0;
    vm.tableSuggested = {};
    var zoneIndexMax = 0;
    var blocks = [];

    vm.guest = {};
    vm.guestList = [];

    vm.testJsonCreate = function() {
        // parse reservation.tables ids
        vm.reservation.tables = [];
        vm.reservation.tables = Object.keys(vm.tablesSelected).reduce(function(result, value) {
                result.push(parseInt(value));
                return result;
            }, []);
        if (vm.reservation.tables.length === 0) {
            if (vm.tableSuggested) {
                vm.reservation.tables.push(vm.tableSuggested.id);
            } else {
                return alert("Debe elegir mesas para la reservacion");
            }
        } 
        // end

        //  paser guest
        if (!vm.reservation.guest_id) {
            vm.reservation.guest = vm.newGuest || {};
            delete vm.reservation.guest_id;
        }
        //  end

        console.log(vm.reservation);
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
        angular.forEach(vm.tablesSelected, function(table, i) {
            var conflict = {};

            if ( vm.reservation.covers < table.minCover ) {
                conflict.name = table.name;
                conflict.desc = "Mesa  demasiado grande";
                vm.conflicts.push(conflict);
            } else if (table.block) {
                conflict.name = table.name;
                conflict.desc = "La mesa se encuentra bloqueada en el rango de duracion de esta reservacion";
                vm.conflicts.push(conflict);
            } else if (table.occupied) {
                conflict.name = table.name;
                conflict.desc = "La mesa ya se encuentra ocupada en el rango de duracion de esta reservacion";
                vm.conflicts.push(conflict);
            }
        });
    };

    var listTableSelected = function() {
        tablesForEach(function(table) {
            if (table.selected) {
                vm.tablesSelected[table.id] = angular.copy(table);
            } else {
                delete vm.tablesSelected[table.id];
            }
        });
        vm.isTablesSelected = Object.keys(vm.tablesSelected).length;

        alertConflicts();
    };

    vm.selectTable = function(table) {
        table.selected = !table.selected;
        listTableSelected();
    };

    vm.tablesBlockValid = function() {
        // console.log("------------------------------------------------");
        var start_time =  moment(vm.reservation.hour, "HH:mm:ss");
        var auxiliar =  moment(vm.reservation.duration, "HH:mm:ss");
        var end_time = start_time.clone().add(auxiliar.hour(), "h").add(auxiliar.minute(), "m");
        // console.log(start_time.format("YYYY-MM-DD HH:mm:ss"), end_time.format("YYYY-MM-DD HH:mm:ss"));
        // console.log(blocks);
        angular.forEach(blocks, function(block){
            var start_block =  moment(block.start_time, "HH:mm:ss");
            var end_block =  moment(block.end_time, "HH:mm:ss");
            // console.log(start_block.format("YYYY-MM-DD HH:mm:ss"), end_time.format("YYYY-MM-DD HH:mm:ss"));
            tablesForEach(function(table) {
                if (table.id == block.res_table_id) {
                    if (block.res_reservation_id !== null) {
                        table.occupied = true;
                        table.suggested = false;
                    } 
                    if ( (start_time.isBetween(start_block, end_block,  null, "()")) || 
                            (end_time.isBetween(start_block, end_block, null, "()")) ||
                                (start_time.isSameOrBefore(start_block) && end_time.isSameOrAfter(end_block))) {
                        table.block = true;
                        table.suggested = false;
                    } else {
                        table.block = false;
                        table.occupied = false;
                    }
                }
            });
        });
        vm.tablesSuggested(vm.reservation.covers);
    };

    vm.tablesSuggested = function(cant){
        vm.tableSuggested = null;
        tablesForEach(function(table) {
            if (cant >= table.minCover && cant <= table.maxCover) {
                if (!table.occupied && !table.block) {
                    if (!vm.tableSuggested) vm.tableSuggested = table;
                    table.suggested = true;
                }
            } else {
                table.suggested = false;
            }
        });
        listTableSelected();
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

    var loadBlocks = function(date) {
        service.getBlocks(date)
            .then(function(response) {
                blocks = response.data.data;
            }).catch(function(error) {
                message.apiError(error);
            }).finally(function(){
                loadTurns(date);
            });
    };

    var loadTurns = function(date) {
        service.getTurns(date)
            .then(function(response) {
                var turns = response.data.data;
                listHours(turns);
                listDurations();
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
                    loadBlocks(date);
                    listGuest();
                    listServers();
                    listStatuses();
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
        if(vm.zones.length) vm.zoneName = vm.zones[i].name;
    };


    angular.element($window).bind('resize', function(){
        var size = screenHelper.size(vm);
        vm.size = size;
        vm.fontSize = 14 *  size / screenHelper.minSize() + "px";
        vm.$digest();
    });

    // Search guest list
    var auxiliar;
    vm.searchGuest = function(name) {
        if (auxiliar)$timeout.cancel( auxiliar );
        if (name == "") {
            vm.guestList = [];
            return;
        }
        var search = function() {
            service.getGuestList(name)
                .then(function(response) {
                    vm.guestList = response.data.data.data;
                }).catch(function(error) {
                    message.apiError(error);
                });
        };

        auxiliar = $timeout(search, 500);
    };

    vm.selectGuest = function(guest) {
        vm.reservation.guest_id = guest.id;
        vm.guest = guest;
        vm.addGuest = false;
    };

    vm.removeGuest = function() {
        vm.reservation.guest_id = null;
        vm.newGuest = null;
        vm.guestList = [];
        vm.addGuest = false;
    };

    // End

    (function Init() {
        loadZones();

        vm.size = screenHelper.size();
        vm.fontSize = 14 *  vm.size / screenHelper.minSize()+ "px";
    })();
}]);