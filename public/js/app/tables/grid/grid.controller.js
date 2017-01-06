angular.module('grid.controller', [])
    .controller('GridCtrl', function($scope, $state, gridDataFactory, gridFactory) {
        var vm = this;
        vm.turns = []; //Listado de turnos activos segun fecha
        vm.fecha_actual = moment().format('YYYY-MM-DD');

        var getTurnsActives = function() {
            gridDataFactory.getTurnsActives(vm.fecha_actual, true).then(
                function success(response) {
                    vm.turns = gridFactory.parseShiftsActives(response);

                    $state.go("mesas.grid.index", {
                        date: vm.fecha_actual,
                        shift: vm.turns[0].name,
                    });
                },
                function error(response) {
                    console.error("getTurnsActives", angular.toJson(response, true));
                }
            );
        };

        var init = function() {
            getTurnsActives();
        };
        init();
    })
    .controller('GridMainCtrl', function($scope, $stateParams, $location, $state, $uibModal, $document, gridDataFactory, gridFactory) {

        var vm = this;

        var openModalReserva = null;

        vm.reservationCreate = {
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

        vm.tablesAvailability = [];
        vm.turns = []; //Listado de turnos activos segun fecha
        vm.fecha_actual = moment().format('YYYY-MM-DD');
        vm.fecha_selected = {
            date: moment(vm.fecha_actual),
            text: ''
        };

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

        var init = function() {
            initCalendarSelectedShift();
            getDataGrid();
        };

        vm.onDragEndReservation = function() {
            vm.reservaDrag.newTime = getTimeByPosicionGrid(vm.reservaDrag.position.left);
            var dataReservation = constructDataUpdate(vm.reservaDrag, "reserva");
            updateReservationGrid(dataReservation);
            //console.log("onDragEndReservation", angular.toJson(vm.reservaDrag, true));
            //console.log("onDragEndReservation", angular.toJson(dataReservation, true));
        };

        vm.onDragEndBlock = function() {
            vm.blockDrag.newTime = getTimeByPosicionGrid(vm.blockDrag.position.left);
            var dataBlock = constructDataUpdate(vm.blockDrag, "block");
            updateBlockGrid(dataBlock);
            // console.log("onDragEndBlock", vm.blockDrag.block.durations);
            console.log("onDragEndBlock", angular.toJson(dataBlock, true));
        };

        vm.selectTimeReservationCreate = function(type, hour, index, posIni, table) {

            if (type == "init") {
                vm.reservationCreate.table = table;
                vm.reservationCreate.hourIni = hour;
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

        vm.moveQuarterHour = function(value) {
            if (vm.tempData.hourIni !== value.hour && vm.tempData.index === value.index) {
                vm.reservationCreate.hourEnd = vm.tempData.hourEnd;
                console.log("moveQuarterHour");
                calculateQuarterHour(value.posIni);
            }
        };

        vm.moveQuarterUp = function(table) {
            console.log("moveQuarterHour");
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
            //gridFactory.getRangoHoursShift(shift);
            _setUrlReload(vm.btnCalendarShift.turn_selected.name);
            console.log("selectedShift", shift);
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

        vm.conflictPopup = function(conflictIni, reserva, reservations) {
            if (conflictIni === undefined) {
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

        var updateReservationGrid = function(data) {
            gridDataFactory.updateReservation(data, data.reservation.id).then(
                function success(response) {
                    vm.reservaDrag.table_update = "";
                    vm.reservaDrag.table = "";
                    //console.log("updateReservationGrid", response);
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
                    vm.btnCalendarShift.turns = gridFactory.parseShiftsActives(vm.gridData.shifts);
                    if (vm.gridData.turns.length > 0) {
                        setSelectedShift($stateParams.shift);
                    }
                },
                function error(response) {
                    console.error("getDataGrid", angular.toJson(response.data, true));
                }
            );
        };

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
            //console.log("constructAvailability", angular.toJson(availabilityTables, true));
        };

        var initCalendarSelectedShift = function() {
            var date = ($stateParams.date === undefined) ? vm.fecha_actual : $stateParams.date;
            vm.fecha_selected.text = date;
            vm.fecha_selected.date = moment(date);
        };

        var setSelectedShift = function(shiftName) {
            var turnSelected = gridFactory.setActiveShiftSelected(shiftName, vm.btnCalendarShift.turns);
            if (turnSelected === null) {
                vm.btnCalendarShift.turns[0].active = true;
                _setUrlReload(null);
            } else {
                vm.btnCalendarShift.turn_selected = turnSelected;
            }

            //console.log("setSelectedShift", angular.toJson(vm.btnCalendarShift, true));

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

        var calculateQuarterHour = function(posIni) {
            posIni = parseInt(posIni);
            /*var total = (posIni === 0) ? 0 : posIni / 62;
            total = (total === 0) ? 1 : total;*/
            var indexPos = getPosIni(posIni);
            if (indexPos === -1) {
                vm.reservationCreate.timeTotal.push({
                    posIni: posIni,
                    hour: vm.tempData.hourIni,
                    index: vm.tempData.index
                });
            } else {
                vm.reservationCreate.timeTotal.splice(indexPos + 1, 1);
            }
        };

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
                    gridFactory.addReservationTableGrid(vm.tablesAvailabilityFinal, reservation, data.action);
                    vm.btnCalendarShift.coversReserva = gridFactory.totalCoversReservations(vm.tablesAvailabilityFinal);
                }

                //console.log("NotifyNewReservation", angular.toJson(vm.tablesAvailabilityFinal, true));
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

        $document.on('mouseup', function() {
            if (vm.reservationCreate.hourIni !== '' && openModalReserva === null) {
                vm.reservationCreate.hourEnd = (vm.reservationCreate.hourEnd === '') ? vm.tempData.hourEnd : vm.reservationCreate.hourEnd;
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
            //ctrlMain.closeModal();
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
            //console.log("initModal", angular.toJson(reservaSelected, true));
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