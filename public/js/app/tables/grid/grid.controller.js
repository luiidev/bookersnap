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
    .controller('GridMainCtrl', function($scope, $stateParams, $location, $state, gridDataFactory, gridFactory) {

        var vm = this;

        vm.reservationCreate = {
            hourIni: '',
            hourEnd: '',
            index: null,
            timeTotal: []
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
            date_text: ''
        };

        //Informacion general para el grid (reservaciones,bloqueos,disponibilidad,config,etc)
        vm.gridData = {};
        //Listado de horas segun turno (se actualiza cuando cambias el turno)
        vm.timesShift = [];
        //Listado de disponibilidad segun mesa(contendra reservas,bloqueos,bloqueos de turnos,etc)
        vm.tablesAvailabilityFinal = [];

        var init = function() {
            initCalendarSelectedShift();
            getDataGrid();
            //history.pushState("", "page 2", "bar.html");
        };

        vm.selectTimeReservationCreate = function(type, hour, index, posIni) {

            //console.log("selectTimeReservationCreate ", type, hour, index, posIni);
            if (type == "init") {
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
                    vm.tempData.index = index;
                    calculateQuarterHour(posIni);

                }
            }
            //console.log("end", angular.toJson(vm.reservationCreate, true));
            if (type === "end") {
                vm.reservationCreate.hourEnd = hour;
                calculateQuarterHour(posIni);

                //console.log("end", angular.toJson(vm.reservationCreate, true));

                vm.reservationCreate.hourIni = '';
                vm.reservationCreate.index = null;
                //vm.reservationCreate.timeTotal = [];
                // angular.element(".cell-item" + index).css("display", "none");
            }
        };

        vm.moveQuarterHour = function(value) {

            if (vm.tempData.hourIni !== value.hour && vm.tempData.index === value.index) {

                calculateQuarterHour(value.posIni);

                console.log("moveQuarterHour", value, angular.toJson(vm.reservationCreate.timeTotal, true));
            }
            //calculateQuarterHour(posIni);
        };

        vm.moveQuarterUp = function() {
            alert("moveQuarterUp");
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
            var date = moment(vm.fecha_selected.text).subtract(1, 'days').format('YYYY-MM-DD');
            vm.fecha_selected.text = date;
            _setUrlReload(null);
        };

        vm.nextDateCalendarShift = function() {
            var date = moment(vm.fecha_selected.text).add(1, 'days').format('YYYY-MM-DD');
            vm.fecha_selected.text = date;
            _setUrlReload(null);
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
                    setSelectedShift($stateParams.shift);
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
                var reservations = gridFactory.getReservationsByTable(table, vm.gridData.reservations, availability, key);

                availabilityTables.push({
                    id: table.id,
                    name: table.name,
                    min_cover: table.min_cover,
                    max_cover: table.max_cover,
                    availability: availability,
                    reservations: reservations
                });
            });

            vm.tablesAvailabilityFinal = availabilityTables;

            //console.log("constructTablesAvailability", angular.toJson(vm.tablesAvailabilityFinal, true));
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

            vm.timesShift = gridFactory.getRangoHoursShift(vm.btnCalendarShift.turn_selected);

            constructTablesAvailability();
        };

        var _setUrlReload = function(shiftName) {
            console.log("_setUrlReload", shiftName);
            shiftName = (shiftName === null) ? vm.btnCalendarShift.turns[0].name : shiftName;
            //$location.url('mesas/grid/2016-12-22/Desayuno');
            // history.pushState("", "page 2", "http://web.aplication.bookersnap/admin/ms/1/mesas#/mesas/grid/2016-12-22/Desayuno");
            $state.go("mesas.grid.index", {
                date: vm.fecha_selected.text,
                shift: shiftName
            }, {
                reload: false
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

        init();

    });