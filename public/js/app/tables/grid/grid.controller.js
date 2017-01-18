angular.module('grid.controller', [])
    .controller('GridCtrl', function($scope, $state, gridDataFactory, gridFactory) {
        var vm = this;
        vm.turns = []; //Listado de turnos activos segun fecha
        vm.fecha_actual = moment().format('YYYY-MM-DD');

        var getTurnsActives = function() {
            gridDataFactory.getTurnsActives(vm.fecha_actual, true).then(
                function success(response) {
                    vm.turns = gridFactory.parseShiftsActives(response);
                    var turnSelected = detectedTurnNow(vm.turns);

                    $state.go("mesas.grid.index", {
                        date: vm.fecha_actual,
                        shift: turnSelected.name,
                    });
                },
                function error(response) {
                    console.error("getTurnsActives", angular.toJson(response, true));
                }
            );
        };

        //Detecta el turno en el que se encuentra actualmente
        var detectedTurnNow = function(turns) {
            var turnSelected = {};
            var timeNow = moment().format("HH:mm:ss");
            var dateNow = moment().format("YYYY-MM-DD");

            angular.forEach(turns, function(turn, key) {

                var nextDay = getHourNextDay(turn.turn.hours_ini, turn.turn.hours_end);
                var dateNowEnd = (nextDay === 1) ? moment(dateNow).add('days', 1).format('YYYY-MM-DD') : dateNow;

                if (moment(dateNow + " " + timeNow).isSameOrAfter(dateNow + " " + turn.turn.hours_ini) && moment(dateNow + " " + timeNow).isSameOrBefore(dateNowEnd + " " + turn.turn.hours_end)) {
                    turnSelected = turn;
                }
            });

            return turnSelected;
        };

        var init = function() {
            getTurnsActives();
        };

        init();
    })
    .controller('GridMainCtrl', function($scope, $stateParams, $location, $state, $uibModal, $document, $compile, $timeout, gridDataFactory, gridFactory, FloorFactory, reservationService) {

        var vm = this;

        var openModalReserva = null;
        var timeoutNotes;

        //para la directiva currentTime Linea de tiempo 
        vm.currentTime = {
            text: '',
            left: ''
        };

        //Datos para renderizar grid de creacion de reserva
        vm.reservationCreate = {
            hourText: '',
            hourIni: '',
            hourEnd: '',
            index: null,
            timeTotal: [],
            table: null
        };

        vm.tempData = {
            hourIni: '',
            index: null
        };

        //End Datos para renderizar grid de creacion de reserva

        vm.tablesAvailability = [];
        vm.turns = []; //Listado de turnos activos segun fecha
        vm.fecha_actual = moment().format('YYYY-MM-DD');
        vm.fecha_selected = {
            date: moment(vm.fecha_actual),
            text: ''
        };

        //Calendario, footer grid
        vm.btnCalendarShift = {
            turns: [],
            turn_selected: {},
            date_text: '',
            coversReserva: 0
        };

        //Informacion general para el grid (reservaciones,bloqueos,disponibilidad,config,etc)
        vm.gridData = {};
        //Listado de horas segun turno (se actualiza cuando cambias el turno)
        vm.timesShift = [];
        //Listado de disponibilidad segun mesa(contendra reservas,bloqueos,bloqueos de turnos,etc)
        vm.tablesAvailabilityFinal = [];

        //Drag de la reservacion
        vm.reservaDrag = {
            position: {},
            table: '',
            table_update: '',
            newTime: '',
            reserva: {}
        };

        //Drag del bloqueo
        vm.blockDrag = {
            position: {},
            block: {},
            newTime: '',
            table: '',
            table_update: '',
            duration: ''
        };

        //Notas del turno
        vm.turnsNotes = [];
        vm.notesData = {
            texto: '',
            res_type_turn_id: ''
        };

        vm.notesBox = false;
        vm.notesBoxValida = false;

        //Width Lienzo Body para manejo del scroll
        vm.gridLienzo = {
            width: ''
        };

        var init = function() {
            initCalendarSelectedShift();
            getDataGrid();
        };

        vm.onDragEndReservation = function() {
            vm.reservaDrag.newTime = getTimeByPosicionGrid(vm.reservaDrag.position.left);

            if (vm.reservaDrag.table !== "") {
                var dataReservation = constructDataUpdate(vm.reservaDrag, "reserva");
                updateReservationGrid(dataReservation);
                console.log("onDragEndReservation", angular.toJson(dataReservation, true));
            }
        };

        vm.onDragEndBlock = function() {
            vm.blockDrag.newTime = getTimeByPosicionGrid(vm.blockDrag.position.left);
            var dataBlock = constructDataUpdate(vm.blockDrag, "block");
            updateBlockGrid(dataBlock);
        };

        vm.selectTimeReservationCreate = function(type, hour, index, posIni, table) {

            if (type == "init") {
                vm.reservationCreate.table = table;
                vm.reservationCreate.hourIni = hour;
                vm.reservationCreate.hourText = moment("2016-01-01 " + hour).format("H:mm A");
                vm.reservationCreate.index = index;
                vm.tempData.hourIni = hour;
                vm.tempData.index = index;

                angular.element(".cell-item" + index).css("transform", "translateX(" + posIni + "px)");
                angular.element(".cell-item" + index).css("display", "block");

                calculateQuarterHour(posIni);
            }

            if (type == "move" && index === vm.reservationCreate.index) {

                if ((vm.tempData.hourIni !== hour)) {
                    console.log("move", hour, posIni);
                    vm.tempData.hourIni = hour;
                    vm.tempData.hourEnd = hour;
                    vm.tempData.index = index;
                    calculateQuarterHour(posIni);
                }
            }
            //EVALUANDO ESTE CODIGO (POSIBLEMENTE BORRAR)
            /*   if (type === "end") {
                   vm.reservationCreate.hourEnd = hour;
                   calculateQuarterHour(posIni);

                   vm.reservationCreate.hourIni = '';
                   vm.reservationCreate.index = null;
               }*/
        };

        //Grid de reservacion (creacion) incremantar tamaño
        vm.moveQuarterHour = function(value) {
            if (vm.tempData.hourIni !== value.hour && vm.tempData.index === value.index) {
                vm.reservationCreate.hourEnd = vm.tempData.hourEnd;
                calculateQuarterHour(value.posIni);
            }
        };
        //Grid de reservacion (creacion) finalizar tamaño
        vm.moveQuarterUp = function(table) {
            var timeTotal = vm.reservationCreate.timeTotal.length;
            vm.reservationCreate.hourEnd = vm.reservationCreate.timeTotal[timeTotal - 1].hour;
            vm.reservationCreate.table = table;
            //openModalCreateReserva(table);
        };

        vm.selectedDate = function() {
            vm.fecha_selected.text = moment(vm.fecha_selected.date).format('YYYY-MM-DD');
            _setUrlReload(vm.btnCalendarShift.turn_selected.name);
        };

        vm.selectedShift = function(shift) {
            vm.btnCalendarShift.turn_selected = shift;
            _setUrlReload(vm.btnCalendarShift.turn_selected.name);
        };

        vm.prevDateCalendarShift = function() {
            var validaJson = angular.toJson(vm.gridData);
            if (validaJson.indexOf("shifts") !== -1) {
                var date = moment(vm.fecha_selected.text).subtract(1, 'days').format('YYYY-MM-DD');
                vm.fecha_selected.text = date;
                _setUrlReload(null);
            }
        };

        vm.nextDateCalendarShift = function() {
            var validaJson = angular.toJson(vm.gridData);
            if (validaJson.indexOf("shifts") !== -1) {
                var date = moment(vm.fecha_selected.text).add(1, 'days').format('YYYY-MM-DD');
                vm.fecha_selected.text = date;
                _setUrlReload(null);
            }
        };

        vm.closeModal = function() {
            angular.element(".cell-item" + vm.reservationCreate.index).css("display", "none");
            openModalReserva = null;
            vm.reservationCreate.index = null;
            vm.reservationCreate.hourIni = "";
            vm.reservationCreate.hourEnd = "";
            vm.reservationCreate.timeTotal = [];
            vm.reservationCreate.table = null;
        };
        //Lista de reservaciones en conflicto
        vm.conflictPopup = function(conflictIni, reserva, reservations) {
            if (conflictIni === undefined || conflictIni === false) {
                openModalConflictReserva(reserva, reservations);
            } else {
                vm.redirectReservation(reserva);
            }
        };

        vm.redirectReservation = function(reserva) {
            if (vm.reservaDrag.table === '') {
                $state.go("mesas.grid-reservation-edit", {
                    date: vm.fecha_selected.text,
                    id: reserva.id
                });
            }
        };

        vm.redirectBlock = function(block) {
            if (vm.blockDrag.table === '') {
                $state.go("mesas.grid.block.edit", {
                    date: vm.fecha_selected.text,
                    block_id: block.id
                });
            }
        };

        //Tiempo transcurrido en reservaciones sentadas con la directiva currentTime
        vm.updateCurrentTime = function() {
            angular.forEach(vm.tablesAvailabilityFinal, function(tables, key) {
                angular.forEach(tables.reservations, function(reservation, key) {
                    reservation = gridFactory.currentTimeReservaSit(reservation, vm.btnCalendarShift.turn_selected.turn);
                });
            });
        };

        vm.saveNotes = function(turn) {

            if (timeoutNotes) $timeout.cancel(timeoutNotes);

            vm.notesData.id = turn.notes.id;
            vm.notesData.res_type_turn_id = turn.id;
            vm.notesData.texto = turn.notes.texto;
            vm.notesData.date_add = turn.notes.date_add;

            timeoutNotes = $timeout(function() {
                reservationService.blackList.key(vm.notesData);
                FloorFactory.createNotes(vm.notesData).then(
                    function success(response) {
                        vm.notesSave = true;
                    },
                    function error(response) {
                        message.apiError(response);
                    }
                );
            }, 1000);
        };

        vm.readNotes = function(notification) {
            vm.notesBoxValida = true;
            vm.notesNotification = false;
        };

        vm.listenNotes = function(notification) {
            vm.notesBoxValida = false;
            vm.notesNotification = false;
        };

        var updateReservationGrid = function(data) {
            gridDataFactory.updateReservation(data, data.reservation.id).then(
                function success(response) {
                    vm.reservaDrag.table_update = "";
                    vm.reservaDrag.table = "";
                },
                function error(response) {
                    console.error("updateReservationGrid", response);
                }
            );
        };

        var updateBlockGrid = function(data) {
            gridDataFactory.updateBlock(data, data.block.id).then(
                function success(response) {
                    vm.blockDrag.table_update = "";
                    vm.blockDrag.table = "";
                },
                function error(response) {
                    console.error("updateBlockGrid", response);
                }
            );
        };

        var constructDataUpdate = function(params, option) {
            var data = {
                tables_add: [],
                tables_deleted: []
            };

            var tables = null;

            if (option === "reserva") {
                data.reservation = {
                    id: params.reserva.id,
                    hours_reservation: params.newTime
                };
                tables = params.reserva.tables;
            } else {
                var blockDurations = vm.blockDrag.block.durations.split(":");

                data.block = {
                    id: params.block.id,
                    start_time: params.newTime,
                    end_time: moment(vm.blockDrag.block.start_date + " " + vm.blockDrag.newTime).add("hours", blockDurations[0]).add("minutes", blockDurations[1]).format("HH:mm:ss")
                };
                tables = params.block.tables;
            }

            if (params.table !== params.table_update) {
                var existsTable = gridFactory.existsDataInArray(params.table_update, tables);
                if (existsTable === false) {
                    data.tables_add.push(params.table_update);
                }
                data.tables_deleted.push(params.table);
            }

            return data;
        };
        //Obtiene la hora segun la posicion en el grid
        var getTimeByPosicionGrid = function(positionGrid) {
            var time = "";

            angular.forEach(vm.tablesAvailabilityFinal[0].availability, function(availability, key) {
                if (positionGrid === availability.position_grid) {
                    time = availability.time;
                }
            });

            return time;
        };

        var openModalConflictReserva = function(reservaSelected, reservations) {
            $uibModal.open({
                templateUrl: 'ModalConflictReservation.html',
                controller: 'ModalGridReservationConflictCtrl',
                controllerAs: 'vm',
                keyboard: false,
                size: '',
                resolve: {
                    ctrlMain: function() {
                        return vm;
                    },
                    reservaSelected: function() {
                        return reservaSelected;
                    },
                    reservations: function() {
                        return reservations;
                    }
                }
            }).result.catch(function() {

            });
        };

        var openModalCreateReserva = function(table) {
            openModalReserva = $uibModal.open({
                templateUrl: 'ModalCreateGridReservation.html',
                controller: 'ModalGridReservationCtrl',
                controllerAs: 'br',
                keyboard: false,
                size: '',
                resolve: {
                    date: function() {
                        return vm.fecha_selected.text;
                    },
                    table: function() {
                        return table;
                    },
                    hourReservation: function() {
                        return vm.reservationCreate;
                    },
                    ctrlMain: function() {
                        return vm;
                    }
                }
            }).result.catch(function() {
                vm.closeModal();
            });
        };

        var getDataGrid = function() {
            var params = {
                date: vm.fecha_selected.text
            };
            gridDataFactory.getGrid(params).then(
                function success(response) {
                    vm.gridData = response.data.data;
                    vm.tablesAvailability = vm.gridData.availabilityTables;

                    vm.turns = gridFactory.parseShiftsActives(vm.gridData.shifts);
                    vm.turnsNotes = vm.gridData.shifts;
                    vm.btnCalendarShift.turns = gridFactory.parseShiftsActives(vm.gridData.shifts);

                    if (vm.gridData.turns.length > 0) {
                        setSelectedShift($stateParams.shift);
                    }

                    constructCurrentTime();
                },
                function error(response) {
                    console.error("getDataGrid", angular.toJson(response.data, true));
                }
            );
        };

        //Habilita la directiva currentTime , si existe turno para el dia
        var constructCurrentTime = function() {
            var validate = angular.toJson(vm.btnCalendarShift.turn_selected);

            if (validate.indexOf('turn') !== -1) {

                var directiveCurrentime = '<current-time left-time="vm.currentTime.left" turn="vm.btnCalendarShift.turn_selected" update-time="vm.updateCurrentTime()">' +
                    '</current-time>';

                var content = $compile(directiveCurrentime)($scope);

                angular.element(".grid-inner-container").append(content);
            }
        };

        //Construye el grid
        var constructTablesAvailability = function() {
            var availabilityTables = [];
            angular.forEach(vm.tablesAvailability, function(table, key) {
                var availability = gridFactory.constructAvailability(table.availability, vm.btnCalendarShift.turn_selected);
                var reservations = gridFactory.getReservationsByTable(table, vm.gridData.reservations, availability, key, vm.btnCalendarShift.turn_selected.turn);
                var blocks = gridFactory.getBlocksByTable(table, vm.gridData.blocks, availability, key);

                availabilityTables.push({
                    id: table.id,
                    name: table.name,
                    min_cover: table.min_cover,
                    max_cover: table.max_cover,
                    availability: availability,
                    reservations: reservations,
                    blocks: blocks
                });
            });

            vm.tablesAvailabilityFinal = availabilityTables;
            vm.btnCalendarShift.coversReserva = gridFactory.totalCoversReservations(vm.tablesAvailabilityFinal);
            vm.gridLienzo.width = (vm.tablesAvailabilityFinal[0].availability.length * 62) + 2;
        };

        var initCalendarSelectedShift = function() {
            var date = ($stateParams.date === undefined) ? vm.fecha_actual : $stateParams.date;
            vm.fecha_selected.text = date;
            vm.fecha_selected.date = moment(date);
        };
        //Actualiza el grid al seleccionar un turno
        var setSelectedShift = function(shiftName) {
            var turnSelected = gridFactory.setActiveShiftSelected(shiftName, vm.btnCalendarShift.turns);
            if (turnSelected === null) {
                vm.btnCalendarShift.turns[0].active = true;
                _setUrlReload(null);
            } else {
                vm.btnCalendarShift.turn_selected = turnSelected;
            }
            vm.timesShift = gridFactory.getRangoHoursShift(vm.btnCalendarShift.turn_selected);
            constructTablesAvailability();
        };

        var _setUrlReload = function(shiftName) {
            if (vm.gridData.turns.length > 0) {
                shiftName = (shiftName === null) ? vm.btnCalendarShift.turns[0].name : shiftName;
            } else {
                shiftName = $stateParams.shift;
            }
            $state.go("mesas.grid.index", {
                date: vm.fecha_selected.text,
                shift: shiftName
            }, {
                reload: true
            });
        };

        //Calcula la posicion donde se ubica la reserva en el grid y el total de tiempo
        var calculateQuarterHour = function(posIni) {
            console.log("calculateQuarterHour", posIni);
            posIni = parseInt(posIni);
            /*var total = (posIni === 0) ? 0 : posIni / 62;
            total = (total === 0) ? 1 : total;*/
            var indexPos = getPosIni(posIni);
            if (indexPos === -1) {
                vm.reservationCreate.timeTotal.push({
                    posIni: posIni, //posicion en la columna de la matriz del grid
                    hour: vm.tempData.hourIni,
                    index: vm.tempData.index //posicion en la fila de la matriz del grid
                });
            } else {
                vm.reservationCreate.timeTotal.splice(indexPos + 1, 1);
            }
        };

        //Comprueba que la reservacion ya ocupa la casilla en la columna -> posIni
        var getPosIni = function(posIni) {
            var total = vm.reservationCreate.timeTotal.length;
            var index = -1;

            for (var i = 0; i < total; i++) {
                if (vm.reservationCreate.timeTotal[i].posIni === posIni) {
                    return i;
                }
            }
            return index;
        };

        $scope.$on("NotifyNewReservation", function(evt, data) {

            $scope.$apply(function() {
                var reservation = (data.action === "create") ? data.data : data.data[0];

                if (reservation.date_reservation === vm.fecha_selected.text) {
                    gridFactory.addReservationTableGrid(vm.tablesAvailabilityFinal, reservation, data.action, vm.btnCalendarShift.turn_selected);
                    vm.btnCalendarShift.coversReserva = gridFactory.totalCoversReservations(vm.tablesAvailabilityFinal);
                }
            });
        });

        $scope.$on("NotifyNewBlock", function(evt, data) {
            $scope.$apply(function() {
                var block = data.data[0];

                if (block.start_date === vm.fecha_selected.text) {
                    gridFactory.addBlockTableGrid(vm.tablesAvailabilityFinal, block, data.action);
                }

            });
        });

        $scope.$on("floorNotesReload", function(evt, note) {
            if (!reservationService.blackList.contains(note.key)) {
                angular.forEach(vm.turnsNotes, function(typeTurn) {
                    if (typeTurn.turn) {
                        if (note.data.res_type_turn_id == typeTurn.turn.res_type_turn_id) {
                            typeTurn.notes = typeTurn.notes ? typeTurn.notes : {};
                            typeTurn.notes.texto = note.data.texto;
                        }
                    }
                });

                if (!vm.notesBoxValida) {
                    vm.notesNotification = true;
                }

                $scope.$apply();
            }
        });

        //Para disparar el popup de reservacion ->creación
        $document.on('mouseup', function() {
            if (vm.reservationCreate.hourIni !== '' && openModalReserva === null) {
                vm.reservationCreate.hourEnd = (vm.reservationCreate.hourEnd === '') ? vm.tempData.hourEnd : vm.reservationCreate.hourEnd;
                console.log("onDragEndReservation", angular.toJson(vm.reservationCreate.timeTotal, true));
                openModalCreateReserva(vm.reservationCreate.table);
            }
        });

        init();
    })
    .controller("ModalGridReservationCtrl", function($rootScope, $state, $uibModalInstance, $q, reservationService,
        reservationHelper, $timeout, ctrlMain, table, hourReservation, date, FloorFactory, global, $table) {

        var vm = this;
        var auxiliar;

        vm.reservation = {};
        vm.reservation.status_id = 1;
        vm.reservation.tables = [];
        vm.addGuest = true;
        vm.buttonText = 'Agregar a lista de espera';
        vm.title = "Nueva entrada";
        vm.covers = [];
        vm.guestList = [];
        vm.waitingResponse = false;

        var tables, blocks;

        var listGuest = function() {
            var covers = [];
            for (var i = table.min_cover; i <= table.max_cover; i++) {
                var text = (i == 1) ? "Invitado" : "Invitados";
                covers.push({
                    id: i,
                    name: i + " " + text
                });
            }
            vm.covers = covers;
            vm.reservation.covers = vm.covers[0].id;
        };

        var parseInfoReservation = function() {
            date = date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
            vm.info = {
                date: moment(date).format("dddd, MM/DD"),
                dateFinal: date,
                time: hourReservation.hourIni,
                tableName: table.name
            };
            addTableReservation(table);
            // hourReservation.hourIni = moment(date + " " + hourReservation.hourIni).add("minutes", 15).format("HH:mm:ss");
            hourReservation.hourEnd = moment(date + " " + hourReservation.hourEnd).add("minutes", 15).format("HH:mm:ss");
            vm.reservation.duration = calculateDuration(hourReservation.hourIni, hourReservation.hourEnd);
        };

        var addTableReservation = function(table) {
            vm.reservation.tables.push(table.id);
        };

        var prepareDataSave = function() {
            vm.reservation.date = vm.info.dateFinal;
            vm.reservation.hour = vm.info.time;

            if (!vm.reservation.guest_id) {
                if (vm.newGuest) {
                    delete vm.reservation.guest_id;
                    vm.reservation.guest = vm.newGuest;
                }
            } else {
                delete vm.reservation.guest;
            }

            vm.reservation.guest = vm.newGuest;
        };

        var init = function() {
            parseInfoReservation();
            listGuest();
        };

        vm.save = function() {
            prepareDataSave();

            vm.waitingResponse = true;
            reservationService.blackList.key(vm.reservation);
            reservationService.save(vm.reservation).then(
                function success(response) {
                    vm.waitingResponse = false;
                    message.success(response.data.msg);
                    $uibModalInstance.dismiss('cancel');
                },
                function error(error) {
                    vm.waitingResponse = false;
                    message.apiError(error);
                });
        };

        vm.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        //Search guest list
        vm.searchGuest = function(name) {
            if (auxiliar) $timeout.cancel(auxiliar);
            if (!name) {
                vm.guestList.length = 0;
                return;
            }
            var search = function() {
                reservationService.getGuestList(name)
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
            vm.addGuest = true;
        };
        //End Search

        init();
    })
    .controller("ModalGridReservationConflictCtrl", function($state, $uibModalInstance, $q, reservations, reservaSelected, ctrlMain) {
        var vm = this;

        vm.reservations = [];

        vm.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        vm.redirectReservation = function(reserva) {
            vm.cancel();
            ctrlMain.redirectReservation(reserva);
        };

        var init = function() {
            vm.reservations = getReservationsConflict(reservaSelected.styles.conflictsData, reservations);
        };

        var getReservationsConflict = function(conflictsData, reservations) {
            var reservationsConflict = [];

            angular.forEach(reservations, function(reserva, key) {
                if (conflictsData.indexOf(reserva.id) !== -1) {
                    reservationsConflict.push(reserva);
                }
            });

            return reservationsConflict;
        };

        init();
    });