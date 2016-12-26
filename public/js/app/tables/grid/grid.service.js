angular.module('grid.service', [])
    .factory('gridDataFactory', function($http, $q, TablesDataFactory, FloorFactory, ApiUrlMesas) {

        return {
            getGrid: function(params) {
                return $http.get(ApiUrlMesas + "/web-app/grid", {
                    params: params
                });
            },
            getTurnsActives: function(date, reload) {
                return FloorFactory.listTurnosActivos(date, reload);
            }
        };
    })
    .factory('gridFactory', function($q) {

        return {
            //Devuelve los turnos activos
            parseShiftsActives: function(data) {
                var shifts = [];

                angular.forEach(data, function(value, key) {
                    if (value.turn !== null) {
                        shifts.push(value);
                    }
                });

                return shifts;
            },
            //Asigna la propiedad active = true al turno seleccionado (disponible por la url)
            setActiveShiftSelected: function(shiftName, shifts) {
                var shiftData = null;

                angular.forEach(shifts, function(shift, key) {
                    if (shift.name === shiftName) {
                        shift.active = true;
                        shiftData = shift;
                    }
                });

                return shiftData;
            },
            //Devuelve listado de horas con intervalos de 15 minutos para el grid (segun turno)
            getRangoHoursShift: function(shift) {
                var hours = getRangoHours(shift.turn.hours_ini, shift.turn.hours_end, true);

                angular.forEach(hours, function(hour, key) {
                    var hourArray = hour.hour24.split(":");

                    if (hourArray[1] === "00") {
                        hour.init = true;
                        hour.hour12 = moment("2015-01-01 " + hour.hour24).format("H A");
                    }

                    if (hourArray[1] === "30") {
                        hour.half = true;
                    }

                    if (hourArray[1] !== "30" && hourArray[1] !== "00") {
                        hour.quarter = true;
                    }
                });

                return hours;
            },
            //Devuelve la disponibilidad segun las reglas y el horario)
            constructAvailability: function(availabilityTables, shift) {
                var availability = [];
                var indexHourIni = getIndexHour(shift.turn.hours_ini, null);
                var nextDay = getHourNextDay(shift.turn.hours_ini, shift.turn.hours_end);
                var indexHourEnd = getIndexHour(shift.turn.hours_end, nextDay);
                var pos = 0;
                for (var i = indexHourIni; i <= indexHourEnd; i++) {
                    if (availabilityTables[i].rule_id > 0) {
                        availabilityTables[i].availability = true;
                    }
                    availabilityTables[i].position_grid = pos;
                    pos += 62;
                    availability.push(availabilityTables[i]);
                }

                return availability;
            },
            //Devuelve las reservaciones para la mesa
            getReservationsByTable: function(table, reservations, availability, indexTable) {
                var self = this;
                var reservationsData = [];

                angular.forEach(reservations, function(reservation, key) {
                    var existsTable = self.searchTableInReservation(table, reservation);
                    if (existsTable === true) {
                        reservation = self.calculatePositionGrid(reservation, availability, indexTable);
                        reservation.styles = {
                            conflicts: false,
                            zIndex: 98
                        };

                        reservationsData.push(reservation);
                    }
                });

                angular.forEach(reservationsData, function(reservation, key) {
                    self.setConflictsReservations(reservationsData, reservation);
                });

                return reservationsData;
            },
            //Identifica y asigna los conflictos entre reservaciones para la mesa
            setConflictsReservations: function(reservations, reservation) {
                var hours = reservation.hours_duration.split(":");
                var hour_ini = reservation.hours_reservation;
                var hour_end = moment(reservation.date_reservation + " " + hour_ini).add(hours[0], 'hours').add(hours[1], 'minutes').format("HH:mm:ss");

                angular.forEach(reservations, function(reserva, key) {
                    if (reservation.id !== reserva.id) {
                        var rt_hours = reserva.hours_duration.split(":");
                        var rt_hour_ini = reserva.hours_reservation;
                        var rt_hour_end = moment(reserva.date_reservation + " " + rt_hour_ini).add(rt_hours[0], 'hours').add(rt_hours[1], 'minutes').format("HH:mm:ss");

                        if ((moment(reserva.date_reservation + " " + rt_hour_ini).isSameOrAfter(reservation.date_reservation + " " + hour_ini) && (moment(reserva.date_reservation + " " + rt_hour_ini).isSameOrBefore(reservation.date_reservation + " " + hour_end)))) {
                            //console.log("getConflictsReservations", rt_hour_ini, hour_ini, hour_end, reservation.id, reserva.id);
                            reservation.styles.conflicts = true;
                            reservation.styles.zIndex -= 1;
                            reserva.styles.conflicts = true;
                        }
                    }
                });

                return reservations;
            },
            //Devuelve true , si la mesa ha sido reservada
            searchTableInReservation: function(table, reservation) {
                var response = false;
                angular.forEach(reservation.tables, function(tableRes, key) {
                    if (tableRes.id === table.id) {
                        response = true;
                    }
                });

                return response;
            },
            //Devuelve la reservacion con el campo position_grid
            calculatePositionGrid: function(reservation, availability, indexTable) {

                angular.forEach(availability, function(value, key) {
                    if (value.time == reservation.hours_reservation) {
                        reservation.position_grid = value.position_grid;
                    }
                });

                var total_grid = calculateMinutesTime(reservation.date_reservation + " " + reservation.hours_duration) / 15;

                reservation.total_grid = [];

                var posIni = reservation.position_grid;
                var hour = reservation.hours_reservation;

                for (var i = 0; i <= total_grid; i++) {
                    reservation.total_grid.push({
                        posIni: posIni,
                        hour: hour,
                        index: indexTable
                    });
                    posIni += 62;
                    hour = moment(reservation.date_reservation + " " + hour).add("minutes", 15).format("HH:mm:ss");
                }

                return reservation;
            },
            //Agrega reservacion a la mesa - grid
            addReservationTableGrid: function(tablesAvailabilityFinal, reservation, action) {
                var self = this;

                angular.forEach(tablesAvailabilityFinal, function(tableAvailability, indexTable) {
                    angular.forEach(reservation.tables, function(table, key) {
                        if (tableAvailability.id === table.id) {
                            reservation = self.calculatePositionGrid(reservation, tableAvailability.availability, indexTable);
                            reservation.styles = {
                                conflicts: false,
                                zIndex: 98
                            };
                            if (action === "create") {
                                tableAvailability.reservations.push(reservation);
                            } else {
                                var indexReserva = self.getIndexReservationsInTable(tableAvailability.reservations, reservation);
                                tableAvailability.reservations[indexReserva] = reservation;
                                console.log("addReservationTableGrid12", angular.toJson(reservation, true));
                            }
                        }
                    });

                    angular.forEach(tableAvailability.reservations, function(reserva, key) {
                        self.setConflictsReservations(tableAvailability.reservations, reserva);
                    });
                });
            },
            //Busca el indice de la reservacion para actualizarlo
            getIndexReservationsInTable: function(tableReservations, reservation) {
                var index = null;
                angular.forEach(tableReservations, function(reserva, key) {
                    if (reserva.id === reservation.id) {
                        index = key;
                    }
                });
                return index;
            }

        };
    });