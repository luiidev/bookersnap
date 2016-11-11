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
                        reservation: {
                            exists: existsReservation.exists,
                            data: existsReservation.data
                        },
                        block: {
                            exists: existsBlocks.exists,
                            data: existsBlocks.data
                        }
                    };

                    book.push(dataBook);

                });

                console.log("listBook " + angular.toJson(book, true));

                return book;
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