angular.module('reservation.controller', [])
    .controller("reservationCtrl.StoreUpdate", ["$scope", "ZoneLienzoFactory", "$window", "$stateParams", "$timeout",
        "screenHelper", "reservationService", "reservationHelper", "screenSize", "$state", "$table", "$q",
        function($scope, ZoneLienzoFactory, $window, $stateParams, $timeout, screenHelper, service, helper, screenSize, $state, $table, $q) {
            var vm = this;

            /**
             * Zonas que se deben mostar
             * @type {Array}
             */
            vm.showZones = []

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


            /**
             * Datepicker config
             */
            $scope.toggleMin = function() {
                $scope.minDate = $scope.minDate ? null : new Date();
            };
            $scope.toggleMin();

            $scope.open = function($event, opened) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope[opened] = true;
            };

            $scope.format = 'dd-MM-yyyy';
            /**
             * END Datepicker config
             */


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

            var reset = function() {
                vm.tablesSelected = {};
                vm.zones.length = 0;
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
                console.log(vm.reservation);
                vm.tablesSuggested(vm.reservation.covers);
            };

            vm.changeHour = function() {
                if (!vm.hour) {
                    vm.reservation.hour = null;
                } else {
                    vm.reservation.hour = vm.hour.time;
                    vm.showZones = [];

                    angular.forEach(vm.hour.zones, function(zone) {
                        vm.showZones.push(zone.id);
                    });

                    if (  vm.showZones.indexOf(vm.zones[vm.zoneIndex].id) === -1) {
                        return vm.nextZone();
                    } else {
                        vm.zoneID = vm.zones[vm.zoneIndex].id;
                    }
                    vm.tablesBlockValid ();
                }
            }

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
                        vm.hour = data.objDefault;
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
                    });

                return deferred.promise;
            };

            var loadReservations = function() {
                var deferred = $q.defer();

                service.getReservations()
                    .then(function(response) {
                        reservations = response.data.data;
                        deferred.resolve(reservations);
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

                if (  vm.showZones.indexOf(vm.zones[vm.zoneIndex].id) === -1) {
                    return vm.nextZone();
                } else {
                    vm.zoneID = vm.zones[vm.zoneIndex].id;
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

                if (  vm.showZones.indexOf(vm.zones[vm.zoneIndex].id) === -1) {
                    return vm.prevZone();
                } else {
                    vm.zoneID = vm.zones[vm.zoneIndex].id;
                }
            };

            angular.element($window).bind('resize', function() {
                sizeLienzo();
                $scope.$digest();
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
                vm.searchListHide = false;
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

            // vm.searchListHide = function() {
            //     vm.guestList = [];
            // };
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
                    // hour: reservation.hours_reservation, //Ahora se maneja por filterHour - ya que la hora se maneja por objeto y escucha su cambio
                    duration: reservation.hours_duration,
                    covers: reservation.num_guest,
                    note: reservation.note,
                    server_id: reservation.res_server_id
                };

                vm.hour = filterHour(vm.hours, reservation.hours_reservation);

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
            
            var filterHour = function(hours, defaultItem) {
                var timeDefault;

                var now = moment().add((15 - (parseInt(moment().format("mm")) % 15)), "minutes").second(0).millisecond(0);
                var timeDefaultIsEstablished = false;

                var defaultHour = defaultItem ? moment(defaultItem, "HH:mm:ss") : null;

                angular.forEach(hours, function(hour) {
                    if (!timeDefaultIsEstablished) {
                        var hourTime = moment(hour.time, "HH:mm:ss");
                        if (hourTime.isSameOrAfter(now) && !timeDefaultIsEstablished) {
                            timeDefault = hour;
                            timeDefaultIsEstablished = true;
                        }

                        if (hourTime.isSame(defaultHour)) {
                            timeDefault = hour;
                            timeDefaultIsEstablished = true;
                        }
                    }
                });

                if (!timeDefault) {
                    if (hours.length > 0) {
                        timeDefault = hours[hours.length - 1];
                    }
                }

                return timeDefault;
            };

            var InitModule = function(date) {
                vm.waitingResponse = true;

                $q.all([
                    loadZones(date),
                    loadBlocks(date),
                    loadReservations(),
                    listGuest(),
                    listServers(),
                    listStatuses(),
                    listReservationTags(),
                    loadTurns(date),
                ]).then(function(data) {
                    loadReservation();
                    loadTablesEdit(data[0], data[2])
                        .then(function() {
                            vm.tablesBlockValid();
                        });
                    vm.changeHour(vm.hour);
                    showTimeCustom();  

                    vm.waitingResponse = false;
                });
            };

            var showTimeCustom = function() {
                var tActive = $table.lastTimeEvent();
                if (tActive) vm.zones.tActive = tActive;
            };

            $scope.$watch("zones", true);

            var loadTablesEdit = function(zones, reservations) {
                var deferred = $q.defer();

                vm.zones = helper.loadTableV2(zones, [{
                    name: "reservations",
                    data: reservations
                }]);

                if ($stateParams.tables) {
                    vm.zones.tablesSelected($stateParams.tables);
                }

                if ($stateParams.hour) {
                    vm.hour = filterHour(vm.hours, $stateParams.hour);
                }

                if ($stateParams.guest) {
                    if (~~Number($stateParams.guest) > 0) {
                        vm.reservation.covers = parseInt($stateParams.guest);
                    }
                }

                setMaxIndex();

                deferred.resolve();

                return deferred.promise;
            };

            vm.changeDate = function() {
                var date = moment(vm.date);

                if (!date.isValid()) {
                    reset();
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
                editState = $state.is("mesas.floor.reservation.edit") || $state.is("mesas.book-reservation-edit");
            };

            var redirect = function() {
                var state = $state.current.name;
                if (state == "mesas.book-reservation-add" || state =="mesas.book-reservation-add-params" || state == "mesas.book-reservation-edit") {
                    $state.go("mesas.book", $stateParams);
                } else {
                    $state.go("mesas.floor.reservation");
                }
            };

            (function Init() {
                isEditSate();
                sizeLienzo();

                initialDate();
            })();
        }
    ]);