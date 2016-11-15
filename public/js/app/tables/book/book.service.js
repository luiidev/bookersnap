angular.module('book.service', [])
    .factory('BookDataFactory', function($http, ApiUrlMesas, FloorDataFactory, CalendarService) {
        var typeTurns, sources, zones;
        return {
            getTypeTurns: function(date) {
                typeTurns = CalendarService.GetShiftByDate(date);
                return typeTurns;
            },
            getSources: function(reload) {
                sources = FloorDataFactory.getSourceTypes(reload);
                return sources;
            },
            getZones: function(params) {
                zones = CalendarService.GetZones(params.date_ini, params.date_end, params.reload);
                return zones;
            }
        };

    })
    .factory('BookFactory', function($q, reservationService, CalendarService, BlockFactory) {

        return {
            getReservations: function(reload, date) {
                var defered = $q.defer();

                reservationService.getReservations(reload, date).then(
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
            listBook: function(hours, reservations, blocks) {
                var self = this;
                var book = [];

                angular.forEach(hours, function(hour, key) {
                    var existsReservation = self.existsReservation(hour, reservations);
                    var existsBlocks = self.existsBlocks(hour, blocks);

                    var dataBook = {
                        time: hour.time,
                        time_text: hour.name,
                        turn_id: hour.turn_id,
                        block: null,
                        reservation: null,
                        available: true
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
                                available: false
                            });
                        });

                        if (existsBlocks.exists === true) {
                            book.push(dataBook);
                        }

                        angular.forEach(existsReservation.data, function(reservation, key) {
                            book.push({
                                time: hour.time,
                                time_text: hour.name,
                                turn_id: hour.turn_id,
                                block: null,
                                reservation: reservation,
                                available: false
                            });
                        });

                    }

                });

                return book;
            },
            //Filtramos solo las reservaciones y bloqueos del book
            filterReservationsAndBlocks: function(listBook) {
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

                        data.reservations.push(book);
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
            existsReservation: function(hour, reservations) {
                var exists = {
                    exists: false,
                    data: []
                };

                angular.forEach(reservations, function(reservation, key) {
                    if (hour.time === reservation.hours_reservation) {
                        exists.exists = true;
                        exists.data.push(reservation);
                    }
                });

                return exists;
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
            listReservationAndBlocks: function(reload, date) {
                var self = this;

                return $q.all([self.getReservations(reload, date), self.getAllBlocks(reload, date)]);
            },
            //Agrega los turnos (id) a la lista de marcados
            addTurnsByFilter: function(typeTurn, filterTypeTurns, turns) {
                var self = this;
                if (typeTurn.turn !== null) {
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
                }
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
            //Agrega los sources (id) a la lista de marcados
            addSourcesByFilter: function(source, filterSources, sources) {
                var self = this;
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
            },
            //Habilita en la vista los sources que hallamos marcados
            setCheckedSource: function(sources, sourceId, checked) {
                angular.forEach(sources, function(source, key) {
                    if (source.id == sourceId) {
                        source.checked = checked;
                    }
                });
            },
        };
    });