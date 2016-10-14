angular.module('reservation.controller', [])
.controller("reservationCtrl.Index", [function(){
    console.log("=)");
}])
.controller("reservationCtrl.Store", ["$scope", "ZoneLienzoFactory", "$window", "$stateParams", "$timeout",
    "screenHelper", "reservationService", "reservationHelper", "screenSize", "$state",
        function(vm, ZoneLienzoFactory, $window, $stateParams, $timeout, screenHelper, service, helper, screenSize, $state){

    /**
     * Entidad de reservacion
     * @type {Object}
     */
    vm.reservation = {};

    /**
     * Mesas seleccionadas en el lienzo
     * @type {Object}
     */
    vm.tablesSelected = {};

    /**
     * Saber si se a seleccionado al menos un mesa
     * @type {Boolean}
     */
    vm.isTablesSelected = false;

    /**
     * Conflictos encontrados con mesas | bloqueado, reservado, muy grande
     * @type {Array}
     */
    vm.conflicts = [];

    /**
     * Zonas con sus mesas para los turnos encontrados en la fecha seleccionada
     * @type {Array}
     */
    vm.zones = [];

    /**
     * Indice de zona para la zona que se va a mostrar
     * @type {Number}
     */
    vm.zoneIndex = 0;

    /**
     * Mesa sugeria
     * @type {Object}
     */
    vm.tableSuggested = {};

    /**
     * Fecha de apoyo para input datetime
     * @type {String}
     */
    vm.date = "";

    /**
     * Tags de reservacion
     * @type {Array}
     */
    vm.tags = [];

    /**
     * Tags de reservacion seleccionados
     * @type {Object}
     */
    vm.selectTags = {};

    /**
     * Entidad para nuevo invitado
     * @type {Object}
     */
    vm.guest = {};

    ///////////////////////////////////////////////////////////////
    //  Variables internas de apoyo
    ///////////////////////////////////////////////////////////////
    
    /**
     * Indice maximo de zona que se puede acceder y mostrar
     * @type {Number}
     */
    var zoneIndexMax = 0;

    /**
     * Mesas bloquedas
     * @type {Array}
     */
    var blocks = [];

    /**
     * Listado de invitados encontrados por filtro de busqueda
     * @type {Array}
     */
    vm.guestList = [];

    vm.save = function() {
        ///////////////////////////////////////////////////////////////
        // parse reservation.tables ids
        ///////////////////////////////////////////////////////////////
        vm.reservation.tables = [];
        vm.reservation.tables = Object.keys(vm.tablesSelected).reduce(function(result, value) {
                result.push(parseInt(value));
                return result;
            }, []);
        if (vm.reservation.tables.length === 0) {
            if (vm.tableSuggested) {
                vm.reservation.tables.push(vm.tableSuggested.id);
            } else {
                return message.alert("Debe elegir mesas para la reservacion");
            }
        }

        ///////////////////////////////////////////////////////////////
        // parse reservation.tags
        ///////////////////////////////////////////////////////////////
        vm.reservation.tags = [];
        vm.reservation.tags = Object.keys(vm.selectTags).reduce(function(result, value) {
                result.push(parseInt(value));
                return result;
            }, []);

        ///////////////////////////////////////////////////////////////
        //  parse guest
        ///////////////////////////////////////////////////////////////
        if (!vm.reservation.guest_id) {
            vm.reservation.guest = vm.newGuest || {};
            delete vm.reservation.guest_id;
        } else {
            delete vm.reservation.guest;
        }

        ///////////////////////////////////////////////////////////////
        //  parse date
        ///////////////////////////////////////////////////////////////
        vm.reservation.date = moment(vm.date).format("YYYY-MM-DD");
        
        vm.waitingResponse = true;
        service.save(vm.reservation)
            .then(function(response) {
                message.success(response.data.msg);
                vm.waitingResponse = false;
                vm.cancel();
            }).catch(function(error) {
                message.apiError(error);
                vm.waitingResponse = false;
            });

        console.log(vm.reservation);
        console.log(JSON.stringify(vm.reservation));
    };

    vm.cancel = function() {
        vm.reservation = {};
        vm.selectTags = {};
        vm.guest = {};
        vm.guestList = [];
        vm.addGuest = false;
        defaultView();
        loadZones();
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
        vm.isTablesSelected = Object.keys(vm.tablesSelected).length > 0;

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
                    if ( (start_time.isBetween(start_block, end_block,  null, "()")) || 
                            (end_time.isBetween(start_block, end_block, null, "()")) ||
                                (start_time.isSameOrBefore(start_block) && end_time.isSameOrAfter(end_block))) {
                        if (block.res_reservation_id !== null) {
                            table.occupied = true;
                            table.suggested = false;
                        } else {
                            table.block = true;
                            table.suggested = false;
                        }
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

    var listReservationTags = function() {
        service.getReservationTags()
            .then(function(response) {
                vm.tags = response.data.data;
            }).finally(function(error) {
                message.apiError(error);
            });
    };

    var loadBlocks = function(date) {
        service.getBlocks(date, true)
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
                loadReservation();
                vm.waitingResponse = false;
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
                return message.error("Fecha invalida no se puede cargar las zonas");
            }

            vm.date = new Date(date.replace(/-/g, '\/'));

            // vm.$watch("date", function(newDate) {
            //     var d = moment(newDate).format("YYYY-MM-DD");
            //     $state.go("mesas.reservation-edit", );
            // });

            vm.waitingResponse = true;
            service.getZones(date)
                .then(function(response) {
                    loadTablesEdit(response.data.data);
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    loadBlocks(date);
                    listGuest();
                    listServers();
                    listStatuses();
                    listReservationTags();
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
        var size = screenHelper.size(screenSize);
        vm.size = size;
        vm.fontSize = (14 *  size / screenSize.minSize + "px");
        vm.$digest();
    });

    ///////////////////////////////////////////////////////////////
    // Search guest list
    ///////////////////////////////////////////////////////////////
    var auxiliar;
    vm.searchGuest = function(name) {
        if (auxiliar)$timeout.cancel( auxiliar );
        if (name === "") {
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
    ///////////////////////////////////////////////////////////////
    // End
    ///////////////////////////////////////////////////////////////



    ///////////////////////////////////////////////////////////////
    // Select tags
    ///////////////////////////////////////////////////////////////
    vm.addTag = function(tag) {
        tag.checked = !tag.checked;
        listTagsSelected();
    };

    var listTagsSelected = function() {
        angular.forEach(vm.tags, function(tag) {
            if (tag.checked) {
                vm.selectTags[tag.id] = angular.copy(tag);
            } else {
                delete vm.selectTags[tag.id];
            }
        });
    };
    ///////////////////////////////////////////////////////////////
    // End
    ///////////////////////////////////////////////////////////////



    ///////////////////////////////////////////////////////////////
    // Edit Reservation Case
    ///////////////////////////////////////////////////////////////
    function loadReservation() {
        if (!$state.is("mesas.reservation-edit")) return;
        console.log($stateParams.id);

        vm.isEdit = true;

        var reservation_id = $stateParams.id;

        service.getReservation(reservation_id)
            .then(function(response) {
                console.log(response.data.data);
                vm.reservation = parseReservationEdit(response.data.data);
            }).catch(function(error) {
                message.apiError(error);
            }).finally(function() {

            });
    }

    function parseReservationEdit(reservation) {
        if (reservation.res_guest_id) {
            vm.guest = reservation.guest;
        }

        paintTables(reservation.tables);
        paintTags(reservation.tags);

        return {
             id: reservation.id,
             guest_id: reservation.res_guest_id,
             status_id: reservation.res_reservation_status_id,
             date: reservation.date_reservation,
             hour: reservation.hours_reservation,
             duration: reservation.hours_duration,
             covers: reservation.num_guest,
             note: reservation.note,
             server_id: reservation.res_server_id
        };
    }

    function paintTables(tables) {
        angular.forEach(tables, function(tableInUse) {
            tablesForEach(function(table) {
                if (table.id == tableInUse.id) {
                    table.selected = true;
                }
            });
        });

        listTableSelected();
    }

    function paintTags(tags) {
        angular.forEach(tags, function(tagInUse) {
            angular.forEach(vm.tags, function(tag) {
                if (tag.id == tagInUse.id) {
                    tag.checked = true;
                }
            });
        });

        listTagsSelected();
    }
    ///////////////////////////////////////////////////////////////
    // End
    ///////////////////////////////////////////////////////////////

    (function Init() {
        loadZones();

        vm.size = screenHelper.size(screenSize);
        vm.fontSize = (14 *  vm.size / screenSize.minSize+ "px");
    })();
}]);