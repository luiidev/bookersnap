angular.module('reservation.controller', [])
    .controller("reservationCtrl.Index", [function() {
        console.log("=)");
    }])
    .controller("reservationCtrl.Store", ["$scope", "ZoneLienzoFactory", "$window", "$stateParams", "$timeout",
        "screenHelper", "reservationService", "reservationHelper", "screenSize", "$state", "$table", "$q",
        function(vm, ZoneLienzoFactory, $window, $stateParams, $timeout, screenHelper, service, helper, screenSize, $state, $table, $q) {

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
             * Reservaciones del dia
             * @type {Array}
             */
            var reservations = [];

            /**
             * Listado de invitados encontrados por filtro de busqueda
             * @type {Array}
             */
            vm.guestList = [];

            /**
             * Forzar recarga de datos
             * @type {Boolean}
             */
            var reload = false;

            /**
             * El estado actual es de edicion
             * @type {Boolean}
             */
            var editState = false;

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

                if (editState) {
                    saveEditReservation();
                } else {
                    saveNewReservation();
                }

            };

            /**
             * Save. update and cancel reservation
             */

            var saveNewReservation = function() {
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
            };

            var saveEditReservation = function() {
                vm.waitingResponse = true;
                var id = vm.reservation.id;
                service.edit(id, vm.reservation)
                    .then(function(response) {
                        message.success(response.data.msg);
                        redirect();
                    }).catch(function(error) {
                        message.apiError(error);
                        vm.waitingResponse = false;
                    });
            };

            vm.cancel = function() {
                return redirect();
            };
            /**
             * END Save. update and cancel reservation
             */


            /**
             * Manejo de eventos sobre las tablas
             */
            vm.selectTableAllOrNone = function(indicator) {
                $table.selectTableAllOrNone(vm.zones[vm.zoneIndex], indicator);
                listTableSelected();
            };

            var alertConflicts = function() {
                vm.conflicts = [];
                angular.forEach(vm.tablesSelected, function(table, i) {
                    var conflict = {};

                    if (vm.reservation.covers < table.minCover) {
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

            vm.selectTable = function(table) {
                table.selected = !table.selected;
                listTableSelected();
            };

            var listTableSelected = function() {
                $table.listTableSelected(vm.zones, vm.tablesSelected);
                vm.isTablesSelected = Object.keys(vm.tablesSelected).length > 0;

                alertConflicts();
            };

            vm.tablesBlockValid = function() {
                $table.tablesBlockValid(vm.zones, blocks, vm.reservation, editState, $stateParams.id);
                vm.tablesSuggested(vm.reservation.covers);
            };

            vm.tablesSuggested = function(cant) {
                vm.tableSuggested = $table.tablesSuggested(vm.zones, cant);
                listTableSelected();
            };
            /**
             * END Manejo de eventos sobre las tablas
             */


            /**
             * Servicio HTTP
             */
            var listServers = function() {
                var deferred = $q.defer();

                service.getServers()
                    .then(function(response) {
                        vm.servers = response.data.data;
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var listGuest = function() {
                var deferred = $q.defer();

                service.getGuest()
                    .then(function(guests) {
                        vm.covers = guests;
                        vm.reservation.covers = 2;
                        vm.tablesSuggested(vm.reservation.covers);
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var listStatuses = function() {
                var deferred = $q.defer();

                service.getStatuses()
                    .then(function(response) {
                        vm.statuses = response.data.data;
                        if (vm.statuses.length) vm.reservation.status_id = vm.statuses[0].id;
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var listReservationTags = function() {
                var deferred = $q.defer();

                service.getReservationTags()
                    .then(function(response) {
                        vm.tags = response.data.data;
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var loadBlocks = function(date) {
                var deferred = $q.defer();

                service.getBlocks(date, true)
                    .then(function(response) {
                        blocks = response.data.data;
                        deferred.resolve(response.data.data);
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        // deferred.resolve();
                    });

                return deferred.promise;
            };

            var loadTurns = function(date) {
                var deferred = $q.defer();

                service.getTurns(date, reload)
                    .then(function(response) {
                        var turns = response.data.data;
                        listHours(turns);
                        listDurations();
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var listHours = function(turns) {
                var deferred = $q.defer();

                service.getHours(turns)
                    .then(function(data) {
                        vm.hours = data.hours;
                        vm.reservation.hour = data.default;
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var listDurations = function() {
                var deferred = $q.defer();

                service.getDurations()
                    .then(function(durations) {
                        vm.durations = durations;
                        vm.reservation.duration = "01:30:00";
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var loadZones = function(date) {
                var deferred = $q.defer();

                service.getZones(date, reload)
                    .then(function(response) {
                        // loadTablesEdit(response.data.data);
                        deferred.resolve(response.data.data);
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        // deferred.resolve();
                    });

                return deferred.promise;
            };

            var loadReservations = function() {
                var deferred = $q.defer();

                service.getReservations()
                    .then(function(response) {
                        reservations = response.data.data;
                        deferred.resolve();
                    }).catch(function(error) {
                        message.apiError(error, "No se pudo cargar las reservaciones");
                    });

                return deferred.promise;
            };
            /**
             * END HTTP
             */


            /**
             * Desplazamineto entre zonas
             */
            var setMaxIndex = function() {
                zoneIndexMax = vm.zones.length - 1;
            };

            vm.nextZone = function() {
                if (zoneIndexMax >= 0) {
                    if (vm.zoneIndex + 1 > zoneIndexMax) {
                        vm.zoneIndex = 0;
                    } else {
                        vm.zoneIndex++;
                    }
                }
            };

            vm.prevZone = function() {
                if (zoneIndexMax >= 0) {
                    if (vm.zoneIndex - 1 >= 0) {
                        vm.zoneIndex--;
                    } else {
                        vm.zoneIndex = zoneIndexMax;
                    }
                }
            };

            angular.element($window).bind('resize', function() {
                sizeLienzo();
                vm.$digest();
            });

            var sizeLienzo = function() {
                vm.size = screenHelper.size(screenSize);
                vm.fontSize = (14 * vm.size / screenSize.minSize + "px");
            };
            /**
             * END Desplazamineto entre zonas
             */


            /**
             * Search guest list
             */
            var auxiliar;
            vm.searchGuest = function(name) {
                if (auxiliar) $timeout.cancel(auxiliar);
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
            /**
             * END Search guest list
             */


            /**
             * Select tags
             */
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
            /**
             * END Select tags
             */


            /**
             * Edit Reservation Case
             */
            function loadReservation() {
                if (editState) {
                    var reservation_id = $stateParams.id;

                    if (!reservation_id) {
                        message.error("La reservacion a editar no es valida");
                        return redirect();
                    }

                    vm.isEdit = true;

                    service.getReservation(reservation_id)
                        .then(function(response) {

                            var data = response.data.data;
                            if (data === null) {
                                message.error("No se encontro la reservacion solicitada");
                                return redirect();
                            } else {
                                parseReservationEdit(data);
                                getZoneIndexForTable(data.tables);
                            }
                        }).catch(function(error) {
                            message.apiError(error);
                        });
                }
            }

            vm.cancelReservation = function() {
                message.confirm("¿ Esta seguro de cencelar la reservacion ?", "Esta accion se puede revertir", function() {
                    vm.waitingResponse = true;
                    var id = vm.reservation.id;
                    service.cancel(id)
                        .then(function(response) {
                            message.success(response.data.msg);
                            redirect();
                        }).catch(function(error) {
                            message.apiError(error);
                            vm.waitingResponse = false;
                        });
                });
            };

            function parseReservationEdit(reservation) {
                vm.reservation = {
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

                if (reservation.res_guest_id) {
                    vm.guest = reservation.guest;
                }

                paintTables(reservation.tables);
                paintTags(reservation.tags);
            }

            function paintTables(tables) {
                $table.paintTables(vm.zones, tables);

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

            function getZoneIndexForTable(serverTables) {
                var index = $table.getZoneIndexForTable(vm.zones, serverTables);

                if (index !== null) {
                    vm.zoneIndex = index;
                }
            }
            /**
             * END Edit Reservation Case
             */

            var InitModule = function(date) {
                vm.waitingResponse = true;

                loadReservation();

                $q.all([
                    loadZones(date),
                    loadBlocks(date),
                    listGuest(),
                    listServers(),
                    listStatuses(),
                    listReservationTags(),
                    loadTurns(date),
                    loadReservations(),
                ]).then(function(data) {
                    loadTablesEdit2(data[0], data[1]);
                    vm.tablesBlockValid();

                    var event = $table.lastTimeEvent();
                    if (event) showTimeCustom(event);

                    vm.waitingResponse = false;
                });

                // $q.all([
                //     loadZones(date),
                //     loadBlocks(date),
                //     // loadReservations(),
                // ]).then(function(data) {
                //     loadTablesEdit2(data[0], data[1]);
                // });


            };

            var updateTime;
            var showTimeCustom = function(event) {
                if (updateTime) $timeout.cancel(updateTime);

                $table.makeTime(vm.zones, blocks, reservations, event);
                vm.showTime = true;

                updateTime = $timeout(showTimeCustom, 60000, true, event);
            };

            var loadTablesEdit = function(dataZones) {
                vm.zones = helper.loadTableV2(dataZones);
                setMaxIndex();
            };

            vm.$watch("zones", true);

            var loadTablesEdit2 = function(zones, blocks) {
                vm.zones = helper.loadTableV2(zones, {
                    name: "blocks",
                    data: blocks
                });
                console.log(vm.zones);
                setMaxIndex();
            };

            vm.changeDate = function() {
                var date = moment(vm.date);

                if (!date.isValid()) {
                    return message.error("Fecha invalida no se puede cargar las zonas");
                }

                // forzar recarga de datos: zonas|turnos|bloqueos
                reload = true;
                InitModule(date.format("YYYY-MM-DD"));
            };

            var initialDate = function() {
                var date = moment($stateParams.date, "YYYY-MM-DD", true);

                if (!date.isValid()) {
                    return message.error("Fecha invalida no se puede cargar las zonas");
                }

                vm.date = new Date(date.format("YYYY-MM-DD").replace(/-/g, '\/'));

                InitModule(date.format("YYYY-MM-DD"));
            };

            var isEditSate = function() {
                editState = $state.is("mesas.reservation-edit");
            };

            var redirect = function() {
                $state.go("mesas.floor.reservation");
            };

            (function Init() {
                isEditSate();
                sizeLienzo();

                initialDate();
            })();
        }
    ]);