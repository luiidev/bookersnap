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
            },
            updateReservation: function(data, idReserva) {
                return $http.post(ApiUrlMesas + "/reservations/" + idReserva + "/grid", data);
            },
            updateBlock: function(data, idBlock) {
                return $http.patch(ApiUrlMesas + "/blocks/" + idBlock + "/grid", data);
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
            //Devuelve los bloqueos de la mesa
            getBlocksByTable: function(table, blocks, availability, indexTable) {
                var self = this;
                var blocksData = [];

                angular.forEach(blocks, function(block, key) {
                    var existsTable = self.searchTableInReservation(table, block);
                    if (existsTable === true) {
                        block = self.calculatePositionGridBlock(block, availability, indexTable);
                        block.durations = calculateDuration(block.start_time, block.end_time);
                        blocksData.push(block);
                    }
                });

                return blocksData;
            },
            //Devuelve las reservaciones para la mesa
            getReservationsByTable: function(table, reservations, availability, indexTable, turn) {
                var self = this;
                var reservationsData = [];

                angular.forEach(reservations, function(reservation, key) {
                    var existsTable = self.searchTableInReservation(table, reservation);
                    var validaTurn = self.reservaInTimeValidate(reservation, turn);

                    if (existsTable === true && validaTurn) {
                        reservation = self.calculatePositionGrid(reservation, availability, indexTable);
                        reservation = self.currentTimeReservaSit(reservation);

                        reservation.styles = {
                            conflicts: false,
                            conflictSit: false,
                            zIndex: 98,
                            conflictsData: []
                        };

                        reservationsData.push(reservation);
                    }
                });

                angular.forEach(reservationsData, function(reservation, key) {
                    self.setConflictsReservations(reservationsData, reservation);
                });

                return reservationsData;
            },
            //evalua el tiempo de espera en el grid (solo para reservaciones sentadas)
            currentTimeReservaSit: function(reservation) {
                var timeNow = moment().format("HH:mm:ss");
                var hourEnd = reservation.total_grid[reservation.total_grid.length - 1].hour;
                // console.log("HOUR_END", "=>", reservation.total_grid.length, hourEnd);
                var validate = moment(reservation.date_reservation + " " + hourEnd).isBefore(reservation.date_reservation + " " + timeNow);

                reservation.current_hour_extension = {
                    active: false,
                    total_time_extension: [],
                    partial_block: 0
                };

                if (validate && reservation.res_reservation_status_id === 4) {

                    reservation.current_hour_extension.active = true;

                    var timeReservation = hourEnd.split(":");
                    var timeDiff = moment(reservation.date_reservation + " " + timeNow).subtract("hours", timeReservation[0]).subtract("minutes", timeReservation[1]).format("HH:mm:ss");
                    var totalMinutes = calculateMinutesTime(reservation.date_reservation + " " + timeDiff);
                    // console.log("validate1 minutes", totalMinutes);

                    var totalCellHourExt = totalMinutes / 15;
                    totalCellHourExt = parseInt(totalCellHourExt);

                    var residuoMinutes = totalMinutes - (totalCellHourExt * 15);

                    for (var i = 1; i < totalCellHourExt; i++) {
                        reservation.current_hour_extension.total_time_extension.push({
                            item: i
                        });
                    }
                    //console.log("validate", totalCellHourExt, totalMinutes);
                    reservation.current_hour_extension.partial_block = (residuoMinutes * 4.1333) + "px";
                    //console.log("currentTimeReservaSit", angular.toJson(reservation, true));
                }

                return reservation;
            },
            //Revisa si la reserva esta dentro del turno return => true 
            reservaInTimeValidate: function(reservation, turn) {
                var valida = false;

                var indexHourIni = getIndexHour(turn.hours_ini, 0);
                var indexHourEnd = getIndexHour(turn.hours_end, 0);

                indexHourEnd = (indexHourEnd < indexHourIni) ? indexHourEnd + 96 : indexHourEnd;

                var indexHourReservaIni = getIndexHour(reservation.hours_reservation, 0);

                var dateIni = moment(reservation.datetime_input).format("YYYY-MM-DD");
                indexHourReservaIni = (reservation.date_reservation !== dateIni) ? indexHourReservaIni + 96 : indexHourReservaIni;

                if (indexHourReservaIni >= indexHourIni && indexHourReservaIni <= indexHourEnd) {
                    valida = true;
                }
                return valida;
            },
            //Identifica y asigna los conflictos entre reservaciones para la mesa
            setConflictsReservations: function(reservations, reservation) {
                var self = this;
                var hours = reservation.hours_duration.split(":");
                var hour_ini = reservation.hours_reservation;
                var hour_end = moment(reservation.date_reservation + " " + hour_ini).add(hours[0], 'hours').add(hours[1], 'minutes').format("HH:mm:ss");

                var indexHourEnd = getIndexHour(hour_end, 0);
                var indexHourIni = getIndexHour(hour_ini, 0);

                var dateIni = moment(reservation.datetime_input).format("YYYY-MM-DD");
                indexHourIni = (reservation.date_reservation !== dateIni) ? indexHourIni + 96 : indexHourIni;
                indexHourEnd = (indexHourEnd < indexHourIni) ? indexHourEnd + 96 : indexHourEnd;

                var conflicts = false;
                var conflictsSit = false;
                var totalConflicts = 0;
                var reservationsConflicts = [];

                angular.forEach(reservations, function(reserva, key) {
                    if (reservation.id !== reserva.id) {
                        var rt_hours = reserva.hours_duration.split(":");
                        var rt_hour_ini = reserva.hours_reservation;
                        var rt_hour_end = moment(reserva.date_reservation + " " + rt_hour_ini).add(rt_hours[0], 'hours').add(rt_hours[1], 'minutes').format("HH:mm:ss");

                        /*  var validateRange = (moment(reserva.date_reservation + " " + rt_hour_ini).isSameOrAfter(reservation.date_reservation + " " + hour_ini) && (moment(reserva.date_reservation + " " + rt_hour_ini).isSameOrBefore(reservation.date_reservation + " " + hour_end)));
                        var validateRange2 = (moment(reservation.date_reservation + " " + hour_ini).isSameOrAfter(reserva.date_reservation + " " + rt_hour_ini) && (moment(reservation.date_reservation + " " + hour_ini).isSameOrBefore(reserva.date_reservation + " " + rt_hour_end)));
                            */
                        var rt_indexHourEnd = getIndexHour(rt_hour_end, 0);
                        var rt_indexHourIni = getIndexHour(rt_hour_ini, 0);

                        var dateIni = moment(reserva.datetime_input).format("YYYY-MM-DD");
                        rt_indexHourIni = (reserva.date_reservation !== dateIni) ? rt_indexHourIni + 96 : rt_indexHourIni;
                        rt_indexHourEnd = (rt_indexHourEnd < rt_indexHourIni) ? rt_indexHourEnd + 96 : rt_indexHourEnd;

                        var validateRange = ((rt_indexHourIni >= indexHourIni) && (rt_indexHourIni <= indexHourEnd));
                        var validateRange2 = ((indexHourIni >= rt_indexHourIni) && (indexHourIni <= rt_indexHourEnd));

                        if (validateRange || validateRange2) {
                            totalConflicts += 1;

                            reserva.hour_end = rt_hour_end;
                            reservationsConflicts.push(reserva);

                            reservation.styles.conflicts = true;
                            reserva.styles.conflicts = true;
                            //reserva.styles.conflictIni = true;

                            var validatePopup1 = ((indexHourIni >= rt_indexHourIni) && (indexHourIni <= rt_indexHourEnd && indexHourEnd <= rt_indexHourEnd));

                            if (validatePopup1) {
                                reservation.styles.conflictIni = false;
                                reservation.styles.zIndex += 1;
                            } else {
                                //if (reservation.styles.conflictIni === true || reservation.styles.conflictIni === undefined) {
                                reservation.styles.conflictIni = true;
                                reservation.styles.zIndex -= 1;
                                //}
                            }

                            self.addReservaConflict(reserva.id, reserva);
                            self.addReservaConflict(reservation.id, reserva);
                            conflicts = true;

                            if (totalConflicts >= 2) {
                                var evalua = self.evaluaReservationsHourEnd(reservationsConflicts, reservation.id);
                                if (evalua === true) {
                                    reservation.styles.conflictIni = false;
                                    reservation.styles.zIndex = reserva.styles.zIndex + 1;
                                }
                            }
                        } else {

                            conflictsSit = self.setConflictsReservationsInSit(reservation, reserva);
                            console.log("no hay conflictos", reservation.id, conflictsSit, reservation.styles.conflictSit);
                        /*     if (conflictsSit === false) {
                                   reservation.styles.conflicts = false;
                                   reservation.styles.conflictSit = false;
                                   reservation.styles.zIndex = 98;
                                   reservation.styles.conflictsData = [];
                                   // console.log("reservations no hay conflictos", reservation.id, conflictsSit);
                               }*/

                        }
                    }
                });

                if (reservation.styles.conflicts === true && conflicts === false && (conflictsSit === false && reservation.styles.conflictSit === false)) {

                    reservation.styles.conflicts = false;
                    reservation.styles.zIndex += 1;
                    reservation.styles.conflictIni = false;

                    console.log("entre aqui", reservation.id, conflictsSit);
                }

                //Evaluamos si solo hay una reservacion (no hay conflictos con nada)
                if (reservations.length === 1) {
                    reservation.styles.conflicts = false;
                    reservation.styles.conflictSit = false;
                    reservation.styles.zIndex = 98;
                    reservation.styles.conflictsData = [];
                }
                //console.log("total reservations ", reservations.length, reservation.id);

                return reservation;
            },
            setConflictsReservationsInSit: function(reservaEvaluate, reservation) {
                var response = false;
                var self = this;

                if (reservation.res_reservation_status_id === 4) {

                    reservation.styles.conflicts = true;

                    reservaEvaluate.styles.conflicts = true;
                    //reservaEvaluate.styles.zIndex = reservation.styles.zIndex - 2;
                    reservaEvaluate.styles.conflictSit = true;

                    var validate1 = (moment(reservaEvaluate.date_reservation + " " + reservaEvaluate.hours_reservation).isBefore(reservation.date_reservation + " " + reservation.hours_reservation));

                    if (validate1 === true) {
                        console.log("es principal sit", reservaEvaluate.id);
                        //reservation.styles.conflictIni = true;
                        reservaEvaluate.styles.conflictIni = true;
                    } else {
                        console.log("no principal sit", reservaEvaluate.id);
                        reservation.styles.conflictIni = true;
                        reservaEvaluate.styles.zIndex = reservation.styles.zIndex + 1;
                    }

                    response = true;

                    self.addReservaConflict(reservation.id, reservaEvaluate);
                    self.addReservaConflict(reservaEvaluate.id, reservaEvaluate);
                    // console.log("sentado", reservation.id);
                }

                //console.log("setConflictsReservationsInSit", reservaEvaluate.id, reservation.id, "=>", response);

                return response;
            },
            //Evalua si las reservaciones estan pegadas (continua una tras otra) return =>true
            evaluaReservationsHourEnd: function(reservations, reservaId) {
                var response = false;
                var hourEnd = "";
                var hourIni = "";
                angular.forEach(reservations, function(reserva, key) {
                    if (reserva.id !== reservaId) {
                        if (hourEnd !== "") {
                            hourEnd = moment(reserva.date_reservation + " " + hourEnd).add('minutes', 15).format("HH:mm:ss");
                            hourIni = moment(reserva.date_reservation + " " + hourIni).subtract('minutes', 15).format("HH:mm:ss");

                            if ((hourEnd === reserva.hours_reservation) || (hourIni === reserva.hour_end)) {
                                response = true;
                            }
                        }
                        hourEnd = reserva.hour_end;
                        hourIni = reserva.hours_reservation;
                    }
                });
                return response;
            },
            //Agrega el id de la reserva con la que hay conflicto
            addReservaConflict: function(idReserva, reserva) {
                if (reserva.styles.conflictsData.indexOf(idReserva) === -1) {
                    reserva.styles.conflictsData.push(idReserva);
                }
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
            //Devuelve el bloqueo con el campo position_grid
            calculatePositionGridBlock: function(block, availability, indexTable) {

                angular.forEach(availability, function(value, key) {
                    if (value.time == block.start_time) {
                        block.position_grid = value.position_grid;
                    }
                });

                var duration = calculateDuration(block.start_time, block.end_time);
                var total_grid = calculateMinutesTime(block.start_date + " " + duration) / 15;

                block.total_grid = [];

                var posIni = block.position_grid;
                var hour = block.start_time;

                for (var i = 0; i <= total_grid; i++) {
                    block.total_grid.push({
                        posIni: posIni,
                        hour: hour,
                        index: indexTable
                    });
                    posIni += 62;
                    hour = moment(block.start_date + " " + hour).add("minutes", 15).format("HH:mm:ss");
                }

                return block;
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

                reservation.grid_width = ((total_grid + 1) * 62) + "px";

                return reservation;
            },
            //Agrega || Actualiza reservacion a la mesa : Grid
            addReservationTableGrid: function(tablesAvailabilityFinal, reservation, action) {
                var self = this;

                angular.forEach(tablesAvailabilityFinal, function(tableAvailability, indexTable) {
                    angular.forEach(reservation.tables, function(table, key) {
                        if (tableAvailability.id === table.id) {

                            reservation = self.calculatePositionGrid(reservation, tableAvailability.availability, indexTable);
                            reservation = self.currentTimeReservaSit(reservation);

                            reservation.styles = {
                                conflicts: false,
                                conflictsSit: false,
                                zIndex: 98,
                                conflictsData: []
                            };

                            var indexReserva = self.getIndexReservationsInTableGrid(tableAvailability.reservations, reservation);

                            if (action === "create") {
                                tableAvailability.reservations.push(reservation);
                            } else if (action === "update") {
                                self.deleteReservaInTableAvailablity(tablesAvailabilityFinal, reservation);

                                var existsReserva = self.existsDataInArray(reservation.id, tableAvailability.reservations);
                                if (existsReserva === false) {
                                    tableAvailability.reservations.push(reservation);
                                } else {
                                    tableAvailability.reservations[indexReserva] = reservation;
                                }
                            }
                        }
                    });

                });

                angular.forEach(tablesAvailabilityFinal, function(tableAvailability, indexTable) {
                    //angular.forEach(reservation.tables, function(table, key) {
                    //if (table.id === tableAvailability.id) {
                    angular.forEach(tableAvailability.reservations, function(reserva, key) {
                        self.setConflictsReservations(tableAvailability.reservations, reserva);
                    });
                    // }
                    //});
                });
            },
            //Evalua si el elemento existe en la coleccion , valido para,bloqueos,reservaciones
            existsDataInArray: function(id, data) {
                var exists = false;

                angular.forEach(data, function(value, key) {
                    if (id === value.id) {
                        exists = true;
                    }
                });

                return exists;
            },
            //Agrega || Actualiza bloqueo : Grid 
            addBlockTableGrid: function(tablesAvailabilityFinal, block, action) {
                var self = this;

                angular.forEach(tablesAvailabilityFinal, function(tableAvailability, indexTable) {
                    angular.forEach(block.tables, function(table, key) {
                        if (tableAvailability.id === table.id) {

                            block = self.calculatePositionGridBlock(block, tableAvailability.availability, indexTable);
                            block.durations = calculateDuration(block.start_time, block.end_time);

                            var indexBlock = self.getIndexBlockInTableGrid(tableAvailability.blocks, block);
                            if (action === "create") {
                                tableAvailability.blocks.push(block);
                            } else if (action == "update") {
                                self.deleteBlockInTableAvailablity(tablesAvailabilityFinal, block);

                                var existsBlock = self.existsDataInArray(block.id, tableAvailability.blocks);
                                if (existsBlock === false) {
                                    tableAvailability.blocks.push(block);
                                } else {
                                    tableAvailability.blocks[indexBlock] = block;
                                }
                            }
                        }
                    });

                });
            },
            //Elimina la reservacion (actualizacion de realtime,cuando se cambia de mesa)
            deleteReservaInTableAvailablity: function(tablesAvailabilityFinal, reserva) {
                var self = this;
                angular.forEach(tablesAvailabilityFinal, function(tableAvailability, key) {
                    angular.forEach(tableAvailability.reservations, function(reservaData, key) {
                        var existsTable = self.existsDataInArray(tableAvailability.id, reserva.tables);
                        if (reservaData.id === reserva.id && existsTable === false) {
                            tableAvailability.reservations.splice(key, 1);
                        }
                    });
                });
            },
            //Elimina el bloqueo (actualizacion de realtime,cuando se cambia de mesa)
            deleteBlockInTableAvailablity: function(tablesAvailabilityFinal, block) {
                var self = this;
                angular.forEach(tablesAvailabilityFinal, function(tableAvailability, key) {
                    angular.forEach(tableAvailability.blocks, function(blockData, key) {
                        var existsTable = self.existsDataInArray(tableAvailability.id, block.tables);
                        if (blockData.id === block.id && existsTable === false) {
                            tableAvailability.blocks.splice(key, 1);
                        }
                    });
                });
            },
            //Busca la reservacion en la lista de reservaciones, devuelve posicion (Indice)
            getIndexReservationsInTableGrid: function(tableReservations, reservation) {
                var index = null;
                angular.forEach(tableReservations, function(reserva, key) {
                    if (reserva.id === reservation.id) {
                        index = key;
                    }
                });
                return index;
            },
            //Busca el bloqueo en la lista de bloqueos, devuelve posicion (Indice)
            getIndexBlockInTableGrid: function(tableBlocks, block) {
                var index = null;
                angular.forEach(tableBlocks, function(value, key) {
                    if (value.id === block.id) {
                        index = key;
                    }
                });
                return index;
            },
            //Devuelve total de covers de todas las reservaciones del turno
            totalCoversReservations: function(tablesAvailability) {
                var totalCovers = 0;

                angular.forEach(tablesAvailability, function(tables, key) {
                    angular.forEach(tables.reservations, function(reserva, key) {
                        totalCovers += reserva.num_guest;
                    });
                });

                return totalCovers;
            },
        };
    });