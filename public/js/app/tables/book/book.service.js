angular.module('book.service', [])
    .factory('BookDataFactory', function($http, ApiUrlMesas, FloorDataFactory, FloorFactory, CalendarService) {
        var typeTurns, sources, zones;
        return {
            getTypeTurns: function(date, reload) {
                typeTurns = FloorFactory.listTurnosActivos(date, reload);
                return typeTurns;
            },
            getSources: function(reload) {
                sources = FloorDataFactory.getSourceTypes(reload);
                return sources;
            },
            getZones: function(params) {
                zones = CalendarService.GetZones(params.date_ini, params.date_end, params.reload);
                return zones;
            },
            getBook: function(params) {
                return $http.get(ApiUrlMesas + "/web-app/book?" + params);
            },
            getBookReservations: function(params) {
                return $http.get(ApiUrlMesas + "/web-app/book/history/reservations?" + params);
            },
            getBookHistory: function(params) {
                return $http.get(ApiUrlMesas + "/web-app/book/history?" + params);
            }
        };
    })
    .factory('TablesDataFactory', function($http, ApiUrlMesas) {
        return {
            getAvailability: function(params) {
                return $http.get(ApiUrlMesas + "/tables/availability?" + params);
            }
        };
    })
    .factory('BookFactory', function($q, reservationService, CalendarService, BlockFactory, BookResumenFactory,
        ConfigurationDataService, TablesDataFactory) {
        var scopeMain = null;
        var configReservation = null;
        return {
            getReservations: function(reload, params) {
                var defered = $q.defer();

                reservationService.getReservationsSearch(reload, params).then(
                    function success(response) {
                        response = response.data.data;
                        defered.resolve(response);
                    },
                    function error(response) {
                        defered.reject(response);
                    }
                );
                return defered.promise;
            },
            getAllBlocks: function(reload, params) {
                var defered = $q.defer();

                BlockFactory.getBlocks(reload, params).then(
                    function success(response) {
                        defered.resolve(response.data.data);
                    },
                    function error(response) {
                        defered.reject(response.data);
                    }
                );

                return defered.promise;
            },
            //Genera el book en base a las horas (disponibles de los turnos)
            listBook: function(hours, bookView, reservations, blocks, tablesAvailability) {
                var self = this;
                var book = [];

                var reservation = {
                    data: null,
                    hour_ini: null,
                    hour_end: null,
                    hour_duration: null
                };

                hours = (bookView === false) ? hours : self.generatedHoursAll();

                angular.forEach(hours, function(hour, key) {
                    var existsReservation = self.existsReservation(hour, reservations, bookView);
                    var existsBlocks = self.existsBlocks(hour, blocks);

                    var dataBook = {
                        time: hour.time,
                        time_text: hour.name,
                        turn_id: hour.turn_id,
                        block: null,
                        reservation: null,
                        available: false,
                        tables: []
                    };

                    if (existsBlocks.exists === false && existsReservation.exists === false) {
                        book.push(dataBook);
                    } else {

                        angular.forEach(existsBlocks.data, function(block, key) {
                            book.push({
                                time: hour.time,
                                time_text: hour.name,
                                turn_id: hour.turn_id,
                                block: block,
                                reservation: null,
                                available: false,
                                tables: []
                            });
                        });

                        if (existsBlocks.exists === true || existsReservation.exists === true) {
                            book.push(dataBook);
                        }

                        angular.forEach(existsReservation.data, function(reservation, key) {
                            var hoursTest = moment(reservation.date_reservation +' '+reservation.hours_reservation);
                            book.push({
                                time: hour.time,
                                time_text: hoursTest.format("hh:mm a"),
                                date_text: hoursTest.format("L"),
                                turn_id: hour.turn_id,
                                block: null,
                                reservation: reservation,
                                available: false,
                                tables: []
                            });
                        });
                    }
                });

                //actualizar tablesAvailables con las reservaciones
                self.durationsReservaAvailableBook(reservations, tablesAvailability, bookView);
                //Asignamos las mesas disponibles a la hora
                angular.forEach(book, function(value, key) {
                    if (value.block === null && value.reservation === null) {
                        value = self.assignTablesAvailabilityBook(value, tablesAvailability, reservations, bookView);
                    }
                });
                //console.log("books " + angular.toJson(tablesAvailability, true));
                //book = self.assignAvailabilityTable(book, reservations, bookView);
                //console.log("books " + angular.toJson(book, true));
                return book;
            },
            listBookReservation: function(reservations) {
                var book = [];
                var self = this;

                reservations = self.parseReservations(reservations, true);
                angular.forEach(reservations, function(reserva, key) {

                    var hoursTest = moment(reserva.date_reservation +' '+reserva.hours_reservation);
                    book.push({
                        time: reserva.hours_reservation,
                        time_text: hoursTest.format("hh:mm a"),
                        date_text: hoursTest.format("L"),
                        turn_id: 0,
                        block: null,
                        reservation: reserva,
                        available: false,
                        tables: []
                    });
                });

                return book;
            },
            //Asignamos disponibilidad si hay reservas,analizamos el tiempo de duración
            durationsReservaAvailableBook: function(reservations, tablesAvailability, bookView) {
                var self = this;

                angular.forEach(tablesAvailability, function(table, key) {
                    var exists = self.existsTableReservaInBook(reservations, table.id, bookView);
                    if (exists.exists === true) {
                        self.updateTablesAvailability(table.id, tablesAvailability[key], exists.data);
                        // console.log("la mesa esta reservada " + table.id);
                    }
                });
            },
            //Actualiza la lista de Mesas - Disponibilidad  si tiene reservacion
            updateTablesAvailability: function(tableId, table, reservations) {
                angular.forEach(reservations, function(reservation, key) {
                    if (tableId === table.id) {
                        var date_res = moment(reservation.date_reservation);

                        var hour_ini = moment(reservation.datetime_input).format("HH:mm:ss");
                        var hour_end = moment(reservation.datetime_output).format("HH:mm:ss");
                        var indexHourIni = getIndexHour(hour_ini, 0);
                        var indexHourEnd = getIndexHour(hour_end, 0);

                        var date_ini = moment(reservation.datetime_input).format("YYYY-mm-dd");
                        var date_end = moment(reservation.datetime_output).format("YYYY-mm-dd");

                        if (moment(reservation.date_reservation).isSameOrBefore(date_ini)) {
                            indexHourIni += 96;
                        }
                        if (moment(reservation.date_reservation).isSameOrBefore(date_end)) {
                            indexHourEnd += 96;
                        }

                        var indexHour = getIndexHour(reservation.hours_reservation, 0);

                        for (var i = indexHourIni; i <= indexHourEnd; i++) {
                            table.availability[i].reserva = true;
                        }
                    }
                });
            },
            parseReservations: function(reservations, bookView) {
                var existPaginator = angular.toJson(reservations, true);
                reservations = (bookView === true && existPaginator.indexOf('last_page') > -1) ? reservations.data : reservations;

                return reservations;
            },
            existsTableReservaInBook: function(reservations, table, bookView) {
                var self = this;
                var exists = {
                    data: [],
                    exists: false
                };

                reservations = self.parseReservations(reservations, bookView);

                angular.forEach(reservations, function(reservation, key) {

                    angular.forEach(reservation.tables, function(value, key) {
                        if (table === value.id) {
                            exists.exists = true;
                            exists.data.push(reservation);
                            //return exists;
                        }
                    });


                });

                return exists;
            },
            //Asignamos las mesas con disponibilidad
            assignTablesAvailabilityBook: function(book, tables, reservations, bookView) {
                var self = this;
                var indexHour = getIndexHour(book.time, 0);

                angular.forEach(tables, function(table, key) {

                    if (table.availability[indexHour].time == book.time) {

                        if (table.availability[indexHour].rule_id > 0 && table.availability[indexHour].reserva === false) {

                            book.tables.push({
                                id: table.id,
                                res_zone_id: table.res_zone_id,
                                min_cover: table.min_cover,
                                max_cover: table.max_cover,
                                name: table.name
                            });

                            return;
                        }
                    }
                });

                book.available = (book.tables.length > 0) ? true : false;

                return book;
            },
            //Filtramos solo las reservaciones y bloqueos del book
            filterReservationsAndBlocks: function(listBook, bookView) {
                var data = {
                    reservations: [],
                    blocks: [],
                    availables: []
                };

                angular.forEach(listBook, function(book) {
                    if (book.reservation === null && book.block === null) {
                        data.availables.push(book);
                    } else {

                        if (book.reservation !== null) {
                            book.reservation.table_filter = (book.reservation.tables.length > 0) ? book.reservation.tables[0].name : "";
                            book.reservation.guest_filter = (book.reservation.guest !== null) ? book.reservation.guest.first_name + " " + book.reservation.guest.last_name : "";
                        }

                        if (bookView === false) {
                            data.reservations.push(book);
                        } else {
                            if (book.block === null) {
                                data.reservations.push(book);
                            }
                        }


                    }
                });

                return data;
            },
            existsBlocks: function(hour, blocks) {
                var exists = {
                    exists: false,
                    data: []
                };

                angular.forEach(blocks, function(block, key) {
                    if (block.start_time == hour.time) {
                        exists.exists = true;
                        exists.data.push(block);
                    }
                });

                return exists;
            },
            existsReservation: function(hour, reservations, bookView) {
                var self = this;
                var exists = {
                    exists: false,
                    data: []
                };

                reservations = self.parseReservations(reservations, bookView);

                angular.forEach(reservations, function(reservation, key) {
                    if (hour.time === reservation.hours_reservation) {
                        exists.exists = true;
                        exists.data.push(reservation);
                    }
                });

                return exists;
            },
            //Obtenemos la reservaciones,bloqueos y mesas con su disponibilidad
            listReservationAndBlocks: function(reload, params) {
                var self = this;
                return $q.all([
                    self.getReservations(reload, params),
                    self.getAllBlocks(reload, params),
                    self.getConfigurationReservation(),
                    self.getTablesAvailability(params)
                ]);
            },
            //Habilita en la vista los types turns que hallamos marcados
            setCheckedTypeTurn: function(turns, turnId, checked) {
                angular.forEach(turns, function(turn, key) {
                    if (turn.turn !== null) {
                        if (turn.turn.id == turnId) {
                            turn.checked = checked;
                        }
                    }
                });
            },
            //Habilita en la vista los sources que hallamos marcados
            setCheckedSource: function(sources, sourceId, checked) {
                angular.forEach(sources, function(source, key) {
                    if (source.id == sourceId) {
                        source.checked = checked;
                    }
                });
            },
            //Habilita en la vista las zonas que hallamos marcados
            setCheckedZone: function(zones, zoneId, checked) {
                angular.forEach(zones, function(zone, key) {
                    if (zone.id == zoneId) {
                        zone.checked = checked;
                    }
                });
            },
            //Agrega los turnos (id) a la lista de marcados
            addTurnsByFilter: function(typeTurn, filterTypeTurns, turns, turnAll) {
                var self = this;
                if (typeTurn !== "all") {
                    if (filterTypeTurns.length > 0) {
                        var index = filterTypeTurns.indexOf(typeTurn.turn.id);
                        if (index == -1) {
                            filterTypeTurns.push(typeTurn.turn.id);
                            self.setCheckedTypeTurn(turns, typeTurn.turn.id, true);
                        } else {
                            filterTypeTurns.splice(index, 1);
                            self.setCheckedTypeTurn(turns, typeTurn.turn.id, false);
                        }

                    } else {
                        filterTypeTurns.push(typeTurn.turn.id);
                        self.setCheckedTypeTurn(turns, typeTurn.turn.id, true);
                    }
                } else {

                    filterTypeTurns.length = 0;

                    angular.forEach(turns, function(turn, key) {
                        if (turn.turn !== null) {

                            if (turnAll === false) {
                                self.setCheckedTypeTurn(turns, turn.turn.id, false);
                            } else {
                                filterTypeTurns.push(turn.turn.id);
                                self.setCheckedTypeTurn(turns, turn.turn.id, true);
                            }
                        }
                    });
                }
            },
            //Agrega los sources (id) a la lista de marcados
            addSourcesByFilter: function(source, filterSources, sources, sourceAll) {
                var self = this;
                if (source !== "all") {
                    if (filterSources.length > 0) {
                        var index = filterSources.indexOf(source.id);
                        if (index == -1) {
                            filterSources.push(source.id);
                            self.setCheckedSource(sources, source.id, true);
                        } else {
                            filterSources.splice(index, 1);
                            self.setCheckedSource(sources, source.id, false);
                        }
                    } else {
                        filterSources.push(source.id);
                        self.setCheckedSource(sources, source.id, true);
                    }
                } else {
                    filterSources.length = 0;

                    angular.forEach(sources, function(value, key) {
                        if (sourceAll === false) {
                            self.setCheckedSource(sources, value.id, false);
                        } else {
                            filterSources.push(value.id);
                            self.setCheckedSource(sources, value.id, true);
                        }
                    });
                }
            },
            //Agrega las zones (id) a la lista de marcados
            addZonesByFilter: function(zone, filterZones, zones, zonesAll) {
                var self = this;

                if (zone !== "all") {
                    if (filterZones.length > 0) {
                        var index = filterZones.indexOf(zone.id);

                        if (index == -1) {
                            filterZones.push(zone.id);
                            self.setCheckedZone(zones, zone.id, true);
                        } else {
                            filterZones.splice(index, 1);
                            self.setCheckedZone(zones, zone.id, false);
                        }

                    } else {
                        filterZones.push(zone.id);
                        self.setCheckedZone(zones, zone.id, true);
                    }
                } else {
                    filterZones.length = 0;

                    angular.forEach(zones, function(value, key) {
                        if (zonesAll === false) {
                            self.setCheckedZone(zones, value.id, false);
                        } else {
                            filterZones.push(value.id);
                            self.setCheckedZone(zones, value.id, true);
                        }
                    });
                }
            },
            //Ver si alguna mesa pertenece a la zona
            existsTablesByZone: function(tables, zones) {
                var exists = false;

                angular.forEach(tables, function(table, key) {
                    if (zones.indexOf(table.res_zone_id) != -1) {
                        exists = true;
                    }
                });

                return exists;
            },
            //Calcula el resumen del book, n° reservaciones,invitados,ingresados,etc
            getResumenBook: function(listBook, config) {
                config = (config !== undefined && config !== null) ? config : configReservation;
                var resumen = BookResumenFactory.calculate(listBook, config);
                scopeMain.$broadcast('resumenBookUpdate', resumen);
            },
            setConfigReservation: function(config) {
                configReservation = config;
                return configReservation;
            },
            getConfigurationReservation: function() {
                var defered = $q.defer();

                ConfigurationDataService.getConfiguration().then(
                    function success(response) {
                        defered.resolve(response.data.data);
                    },
                    function error(response) {
                        defered.reject(response.data);
                    }
                );

                return defered.promise;
            },
            //Calcula total de mesas disponibles sobre las mesas ocupadas
            calculateMDS: function(listBook, zones) {

                var totalTables = BookResumenFactory.getTablesZones(zones);
                var totalResSit = BookResumenFactory.getTablesSitRes(listBook);

                var mds = totalResSit + "/" + totalTables;

                return mds;
            },
            //Devuelve el objeto status dentro de un array segun su id
            getStatusById: function(idStatus, statusData) {
                var status = {};
                angular.forEach(statusData, function(value, key) {
                    if (value.id === idStatus) {
                        status = value;
                    }
                });
                return status;
            },
            //Agrega la reservación que llego de la notificación,segun fecha del book
            addNewReservation: function(dates, hours, listBook, listBookMaster, reservation, action) {
                var add = false;
                var self = this;

                if (moment(reservation.date_reservation).isSameOrBefore(dates.end_date) &&
                    moment(reservation.date_reservation).isSameOrAfter(dates.start_date)) {

                    angular.forEach(hours, function(hour, key) {
                        if (reservation.hours_reservation == hour.time) {
                            scopeMain.$apply(function() {

                                self.addReservationBook(listBook, hour, reservation);
                                self.addReservationBook(listBookMaster, hour, reservation);

                                add = true;
                            });
                        }
                    });
                }

                return add;
            },
            addReservationBook: function(listBook, hour, reservation) {
                var valida = false;
                var self = this;

                angular.forEach(listBook, function(book, key) {
                    if (book.reservation !== null) {
                        if (book.reservation.id === reservation.id) {
                            book.reservation = reservation;
                            valida = true;
                        }
                    }
                });

                if (valida === false) {

                    var indexBook = self.getIndexHourBook(listBook, hour);

                    listBook.splice(indexBook, 0, {
                        time: hour.time,
                        time_text: hour.name,
                        turn_id: hour.turn_id,
                        block: null,
                        reservation: reservation,
                        available: false,
                        tables: []
                    });
                }
            },
            //Obtiene el indice del book segun la hora indicada
            getIndexHourBook: function(listBook, hour) {
                var index = 0;
                angular.forEach(listBook, function(book, key) {
                    if (book.time === hour.time) {
                        index = key;
                    }
                });
                return index;
            },
            deleteReservationBook: function(listBook, reservation) {
                angular.forEach(listBook, function(book, key) {
                    if (book.reservation !== null) {
                        if (book.reservation.id === reservation.id) {
                            listBook.splice(key);
                        }
                    }
                });
            },
            //Obtiene las mesas y su disponibilidad segun la fecha indicada (no rango)
            getTablesAvailability: function(params) {
                var defered = $q.defer();

                TablesDataFactory.getAvailability(params).then(
                    function success(response) {
                        defered.resolve(response.data.data);
                    },
                    function error(response) {
                        defered.reject(response.data);
                    }
                );

                return defered.promise;
            },
            //Genera la horas desde 00:00:00 hasta las 24:00:00 (solo para reservaciones)
            generatedHoursAll: function() {
                var hoursBook = [];
                var hours = getRangoHours("00:00:00", "23:45:00", true);

                angular.forEach(hours, function(hour, key) {
                    hoursBook.push({
                        turn: "",
                        time: hour.hour24,
                        name: hour.hour12,
                        turn_id: 0
                    });
                });

                return hoursBook;
            },
            //Obtenemos los turnos en el formato que acepta la funcion : addTurnsByFilter
            parseTurnIdToObjectFilter: function(turns) {
                var turnsData = [];

                angular.forEach(turns, function(value, key) {
                    turnsData.push({
                        turn: {
                            id: parseInt(value)
                        }
                    });
                });

                return turnsData;
            },
            //Obtenemos los colaboradores en el formato que acepta la funcion : addSourcesByFilter
            parseSourceIdToObjectFilter: function(sources) {
                var sourcesData = [];

                angular.forEach(sources, function(value, key) {
                    sourcesData.push({
                        id: parseInt(value)
                    });
                });

                return sourcesData;
            },
            //Obtenemos las zonas en el formato que acepta la funcion : addZonesByFilter
            parseZoneIdToObjectFilter: function(zones) {
                var zonesData = [];

                angular.forEach(zones, function(value, key) {
                    zonesData.push({
                        id: parseInt(value)
                    });
                });

                return zonesData;
            },
            init: function(scope) {
                scopeMain = scope;
            }
        };
    })
    .factory('BookConfigFactory', function() {
        return {
            setConfig: function(config) {
                localStorage.setItem("reservationConfig", angular.toJson(config));
            },
            getConfig: function() {
                var config = (localStorage.getItem("reservationConfig") !== null) ? JSON.parse(localStorage.getItem("reservationConfig")) : null;
                return config;
            },
            clearConfig: function() {
                localStorage.removeItem("reservationConfig");
            }
        };
    })
    .factory('BookResumenFactory', function($q) {

        return {
            calculate: function(listBook, configReservations) {
                var self = this;
                var resumenBook = {
                    reservations: 0,
                    pax: 0,
                    ingresos: 0,
                    conversion: 0
                };

                var resvSit = 0;

                angular.forEach(listBook, function(book, key) {
                    if (book.reservation !== null) {
                        resumenBook.reservations += 1;
                        resumenBook.ingresos += self.calculateIngresos(book, configReservations);
                        resumenBook.pax += book.reservation.num_guest;

                        if (book.reservation.status.id == 4 || book.reservation.status.id == 5) {
                            resvSit += 1;
                        }
                    }
                });

                if (resumenBook.resvSit > 0 || resumenBook.reservations > 0) {
                    resumenBook.conversion = (resvSit / resumenBook.reservations) * 100;
                    resumenBook.conversion = resumenBook.conversion.toFixed(2);
                }

                return resumenBook;
            },
            calculateIngresos: function(book, configRes) {
                var ingresos = 0;

                if (configRes !== null) {

                    if (configRes.status_people_1 === 1) {
                        ingresos += book.reservation.num_people_1;
                    }
                    if (configRes.status_people_2 === 1) {
                        ingresos += book.reservation.num_people_2;
                    }
                    if (configRes.status_people_3 === 1) {
                        ingresos += book.reservation.num_people_3;
                    }
                }

                return ingresos;
            },
            //Obtiene el total de mesas disponibles
            getTablesZones: function(zones) {
                var total = 0;

                angular.forEach(zones, function(zone, key) {
                    angular.forEach(zone.tables, function(table, key) {
                        if (table.status == 1) {
                            total += 1;
                        }
                    });
                });

                return total;
            },
            //Obtiene el total de mesas ocupadas (reservaciones)
            getTablesSitRes: function(listBook) {
                var total = 0;

                angular.forEach(listBook, function(book, key) {
                    if (book.reservation !== null) {
                        if (book.reservation.res_reservation_status_id == 4) {
                            total += book.reservation.tables.length;
                        }
                    }
                });

                return total;
            }

        };
    });