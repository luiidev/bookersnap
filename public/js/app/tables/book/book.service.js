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
                        index: hour.index,
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
                                index: hour.index,
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
                            var hoursTest = moment(reservation.date_reservation + ' ' + reservation.hours_reservation);
                            book.push({
                                time: hour.time,
                                index: hour.index,
                                time_text: hoursTest.format("hh:mm A"),
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
                    var hoursTest = moment(reserva.date_reservation + ' ' + reserva.hours_reservation);
                    book.push({
                        time: reserva.hours_reservation,
                        time_text: hoursTest.format("hh:mm A"),
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

                        var date_ini = moment(reservation.datetime_input).format("YYYY-MM-DD");
                        var date_end = moment(reservation.datetime_output).format("YYYY-MM-DD");

                        if (moment(reservation.date_reservation).isBefore(date_ini)) {
                            indexHourIni += 96;
                        }
                        if (moment(reservation.date_reservation).isBefore(date_end)) {
                            indexHourEnd += 96;
                        }

                        var indexHour = getIndexHour(reservation.hours_reservation, 0);
                        for (var i = indexHourIni; i <= indexHourEnd; i++) {

                            table.availability[i].reserva = true;
                        }
                    }
                });
            },
            //Devuelve las reservaciones, modo reserva tiene otra esctructura de datos (solo contenedor)
            parseReservations: function(reservations, bookView) {
                var existPaginator = angular.toJson(reservations, true);
                reservations = (bookView === true && existPaginator.indexOf('last_page') > -1) ? reservations.data : reservations;

                return reservations;
            },
            //Evalua si la mesa existe en la reserva del book
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
                        }
                    });
                });

                return exists;
            },
            //Asignamos las mesas con disponibilidad
            assignTablesAvailabilityBook: function(book, tables, reservations, bookView) {
                var self = this;
                angular.forEach(tables, function(table, key) {

                    if (table.availability[book.index].time == book.time) {

                        if (table.availability[book.index].rule_id > 0 && table.availability[book.index].reserva === false) {

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
            addNoStatusByFilter: function(state, filterStatus, statusList, showStatus) {
                var self = this;
                if (statusList.length > 0) {
                    var index = filterStatus.indexOf(state.id);
                    if (index == -1 && showStatus === false) {
                        filterStatus.push(state.id);
                    } else if (showStatus === true) {
                        filterStatus.splice(index, 1);
                    }
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
            //Agrega la reservacion al book
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
            //Genera la horas desde 00:00:00 hasta las 24:00:00 (solo para reservaciones)
            generatedHoursAll: function() {
                var hoursBook = [];
                var hours = getRangoHours("00:00:00", "23:45:00", true);

                angular.forEach(hours, function(hour, key) {
                    hoursBook.push({
                        turn: "",
                        index: key,
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
    .factory('BookConfigFactory', function($stateParams, $location) {

        var _BCONF = self;

        _BCONF.localStorageName = 'mesas.book.config';
        _BCONF.configBook = {
            reservationView: false,
            rangeDate: {
                hoy: true,
                week: false, //esta semana
                lastSevenDays: false, //ultimos 7 dias
                lastThirtyDays: false, //ultimos 30 dias
                thisMonth: false, //este mes
                lastMonth: false, //mes pasado
                range: false //rango de fechas
            },
            url: null,
            filters: {
                turns: [],
                status: [],
                sources: [],
                zones: [],
                date: moment().format('YYYY-MM-DD'),
                date_end: moment().format('YYYY-MM-DD'),
            },
            sort: 'time.asc',
            page_size: 30,
            page: 1,
            show: {
                released: true,
                canceled: true,
                blocks: true,
            },
            fields: {
                consume: true,
                messages: true,
                listguests: true,
                source: true
            }
        };

        _BCONF.setConfigBook = function(config) {

            if (config !== undefined) {
                _BCONF.configBook.reservationView = (_BCONF.configBook.reservationView !== undefined) ? config.reservationView : false;
                if (config.rangeDate !== undefined) {
                    _BCONF.configBook.rangeDate.hoy = (_BCONF.configBook.rangeDate.hoy !== undefined) ? config.rangeDate.hoy : false;
                    _BCONF.configBook.rangeDate.week = (_BCONF.configBook.rangeDate.week !== undefined) ? config.rangeDate.week : false;
                    _BCONF.configBook.rangeDate.lastSevenDays = (_BCONF.configBook.rangeDate.lastSevenDays !== undefined) ? config.rangeDate.lastSevenDays : false;
                    _BCONF.configBook.rangeDate.lastThirtyDays = (_BCONF.configBook.rangeDate.lastThirtyDays !== undefined) ? config.rangeDate.lastThirtyDays : false;
                    _BCONF.configBook.rangeDate.thisMonth = (_BCONF.configBook.rangeDate.thisMonth !== undefined) ? config.rangeDate.thisMonth : false;
                    _BCONF.configBook.rangeDate.lastMonth = (_BCONF.configBook.rangeDate.lastMonth !== undefined) ? config.rangeDate.lastMonth : false;
                    _BCONF.configBook.rangeDate.range = (_BCONF.configBook.rangeDate.range !== undefined) ? config.rangeDate.range : false;
                }
                if (config.show !== undefined) {
                    _BCONF.configBook.show.released = (_BCONF.configBook.show.released !== undefined) ? config.show.released : true;
                    _BCONF.configBook.show.canceled = (_BCONF.configBook.show.canceled !== undefined) ? config.show.canceled : true;
                    _BCONF.configBook.show.blocks = (_BCONF.configBook.show.blocks !== undefined) ? config.show.blocks : true;
                }

                if (config.fields !== undefined) {
                    _BCONF.configBook.fields.consume = (_BCONF.configBook.fields.consume !== undefined) ? config.fields.consume : true;
                    _BCONF.configBook.fields.messages = (_BCONF.configBook.fields.messages !== undefined) ? config.fields.messages : true;
                    _BCONF.configBook.fields.listguests = (_BCONF.configBook.fields.listguests !== undefined) ? config.fields.listguests : true;
                    _BCONF.configBook.fields.source = (_BCONF.configBook.fields.source !== undefined) ? config.fields.source : true;
                }
                if (config.filters !== undefined) {
                    _BCONF.configBook.filters.turns = (_BCONF.configBook.filters.turns !== undefined) ? config.filters.turns : [];
                    _BCONF.configBook.filters.status = (_BCONF.configBook.filters.status !== undefined) ? config.filters.status : [];
                    _BCONF.configBook.filters.sources = (_BCONF.configBook.filters.sources !== undefined) ? config.filters.sources : [];
                    _BCONF.configBook.filters.zones = (_BCONF.configBook.filters.zones !== undefined) ? config.filters.zones : [];
                    _BCONF.configBook.filters.date = (_BCONF.configBook.filters.date !== undefined) ? config.filters.date : moment().format('YYYY-MM-DD');
                    _BCONF.configBook.filters.date_end = (_BCONF.configBook.filters.date_end !== undefined) ? config.filters.date_end : moment().format('YYYY-MM-DD');
                }

                _BCONF.configBook.url = (_BCONF.configBook.url !== undefined) ? config.url : null;
                _BCONF.configBook.order = (_BCONF.configBook.order !== undefined) ? config.order : 'time.asc';
                _BCONF.configBook.page_size = (_BCONF.configBook.page_size !== undefined) ? config.page_size : 30;
                _BCONF.configBook.page = (_BCONF.configBook.page !== undefined) ? config.page : 30;
            }
            return _BCONF.configBook;
        };

        _BCONF.initUrlParamsByStorage = function() {

            _BCONF.configBook.url = {};
            _BCONF.configBook.url.date = moment().format("YYYY-MM-DD");
            if (_BCONF.configBook.filters.date !== "") {
                _BCONF.configBook.url.date = _BCONF.configBook.filters.date;
            }
            if (_BCONF.configBook.filters.date_end !== "" && _BCONF.configBook.reservationView) {
                _BCONF.configBook.url.date_end = _BCONF.configBook.filters.date_end;
            }
            if (_BCONF.configBook.filters.status.length > 0) {
                _BCONF.configBook.url.status = _BCONF.configBook.filters.status.toString();
            }
            if (_BCONF.configBook.filters.turns.length > 0) {
                _BCONF.configBook.url.turns = _BCONF.configBook.filters.turns.toString();
            }
            if (_BCONF.configBook.filters.sources.length > 0) {
                _BCONF.configBook.url.sources = _BCONF.configBook.filters.sources.toString();
            }
            if (_BCONF.configBook.page_size != 30) {
                _BCONF.configBook.url.page_size = _BCONF.configBook.page_size;
            }
            if (_BCONF.configBook.page > 1) {
                _BCONF.configBook.url.page = _BCONF.configBook.page;
            }
            if (_BCONF.configBook.sort !== "") {
                _BCONF.configBook.url.sort = _BCONF.configBook.sort;
            }
        };

        _BCONF.saveUrlParams = function() {
            _BCONF.configBook.url = {};
            _BCONF.configBook.url.date = moment().format("YYYY-MM-DD");
            //console.log('_BCONF.configBook: ', _BCONF.configBook);
            if ($stateParams.date !== undefined && $stateParams.date !== "") {
                _BCONF.configBook.url.date = $stateParams.date;
                _BCONF.configBook.filters.date = $stateParams.date;
            }
            if ($stateParams.date_end !== undefined && $stateParams.date_end !== "" && _BCONF.configBook.reservationView) {
                _BCONF.configBook.url.date_end = $stateParams.date_end;
                _BCONF.configBook.filters.date_end = $stateParams.date_end;
            }
            if ($stateParams.status !== undefined && $stateParams.status !== "") {
                _BCONF.configBook.url.status = $stateParams.status;
                _BCONF.configBook.filters.status = $stateParams.status.split(',');
            }
            if ($stateParams.blocks !== undefined && $stateParams.blocks !== "") {
                _BCONF.configBook.url.blocks = $stateParams.blocks;
                _BCONF.configBook.filters.blocks = $stateParams.blocks.split(',');
            }
            if ($stateParams.sources !== undefined && $stateParams.sources !== "") {
                _BCONF.configBook.url.sources = $stateParams.sources;
                _BCONF.configBook.filters.blocks = $stateParams.sources.split(',');
            }
            if ($stateParams.page_size !== undefined && $stateParams.page_size !== "") {
                _BCONF.configBook.url.page_size = $stateParams.page_size;
            }
            if ($stateParams.page !== undefined && $stateParams.page !== "") {
                _BCONF.configBook.url.page = $stateParams.page;
            }
            if ($stateParams.sort !== undefined && $stateParams.sort !== "") {
                _BCONF.configBook.url.sort = $stateParams.sort;
            }
        };

        _BCONF.replaceStateParams = function() {
            var url = $location.absUrl();
            var index = url.indexOf("?");
            url = url.substring(0, index);
            params = getAsUriParameters(_BCONF.configBook.url);
            console.log(url + "?" + params);
            history.replaceState('', 'Pagina', url + "?" + params);
        };

        /* Obtener configuracion de localstorage */
        _BCONF.get = function() {
            var config = (localStorage.getItem(_BCONF.localStorageName) !== null) ? JSON.parse(localStorage.getItem(_BCONF.localStorageName)) : null;
            _BCONF.setConfigBook(config);
        };
        /* Guardar configuracion en localstorage */
        _BCONF.save = function() {
            localStorage.setItem(_BCONF.localStorageName, angular.toJson(_BCONF.configBook));
        };
        /* Remover data de locastorage localstorage */
        _BCONF.remove = function() {
            localStorage.removeItem(_BCONF.localStorageName);
        };

        return {
            setFilter: function(option, values) {
                console.log(option, values);
                switch (option) {
                    case 'turns':
                        _BCONF.configBook.filters.turns = (values !== undefined) ? values : [];
                    case 'status':
                        _BCONF.configBook.filters.status = (values != undefined) ? values : [];
                        break;
                    case 'sources':
                        _BCONF.configBook.filters.sources = (values != undefined) ? values : [];
                        break;
                    case 'zones':
                        _BCONF.configBook.filters.zones = (values != undefined) ? values : [];
                        break;
                    case 'date':
                        _BCONF.configBook.filters.date = (values != undefined) ? values : moment().format('YYYY-MM-DD');
                        break;
                    case 'date_end':
                        _BCONF.configBook.filters.date_end = (values != undefined) ? values : moment().format('YYYY-MM-DD');
                        break;
                }
            },
            save: function() {
                _BCONF.save();
            },
            setConfig: function(config) {
                _BCONF.setConfigBook(config);
                _BCONF.save();
            },
            getConfig: function() {
                _BCONF.get();
                //_BCONF.initUrlParamsByStorage();
                //_BCONF.replaceStateParams();
                return _BCONF.configBook;
            },
            clearConfig: function() {
                _BCONF.remove();
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